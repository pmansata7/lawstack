// ─── Pluggable AI Provider Abstraction ───────────────────────────────
// Supports OpenAI, Anthropic Claude, and AWS Bedrock via a unified interface.
// Provider selection is driven by the org's AiSetting row.

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { fromEnv } from "@aws-sdk/credential-providers";

export type AiProvider = "openai" | "anthropic" | "bedrock";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface CompletionResult {
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export interface IAiProvider {
  name: AiProvider;
  generateCompletion(
    messages: ChatMessage[],
    options?: CompletionOptions,
  ): Promise<CompletionResult>;
  streamCompletion(
    messages: ChatMessage[],
    options?: CompletionOptions,
  ): AsyncGenerator<string>;
}

// ─── OpenAI Provider ──────────────────────────────────────────────────

export class OpenAIProvider implements IAiProvider {
  name: AiProvider = "openai";
  private client: OpenAI;
  private defaultModel: string;

  constructor(apiKey: string, model = "gpt-4o") {
    this.client = new OpenAI({ apiKey });
    this.defaultModel = model;
  }

  async generateCompletion(
    messages: ChatMessage[],
    options?: CompletionOptions,
  ): Promise<CompletionResult> {
    const response = await this.client.chat.completions.create({
      model: options?.model ?? this.defaultModel,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
    });

    return {
      content: response.choices[0]?.message?.content ?? "",
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  }

  async *streamCompletion(
    messages: ChatMessage[],
    options?: CompletionOptions,
  ): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: options?.model ?? this.defaultModel,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }
}

// ─── Anthropic Claude Provider ────────────────────────────────────────

export class AnthropicProvider implements IAiProvider {
  name: AiProvider = "anthropic";
  private client: Anthropic;
  private defaultModel: string;

  constructor(apiKey: string, model = "claude-sonnet-4-20250514") {
    this.client = new Anthropic({ apiKey });
    this.defaultModel = model;
  }

  async generateCompletion(
    messages: ChatMessage[],
    options?: CompletionOptions,
  ): Promise<CompletionResult> {
    const systemMessage = messages.find((m) => m.role === "system");
    const userMessages = messages.filter((m) => m.role !== "system");

    const response = await this.client.messages.create({
      model: options?.model ?? this.defaultModel,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      system: systemMessage?.content,
      messages: userMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const content = response.content
      .filter((c) => c.type === "text")
      .map((c) => ("text" in c ? c.text : ""))
      .join("");

    return {
      content,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
      },
    };
  }

  async *streamCompletion(
    messages: ChatMessage[],
    options?: CompletionOptions,
  ): AsyncGenerator<string> {
    const systemMessage = messages.find((m) => m.role === "system");
    const userMessages = messages.filter((m) => m.role !== "system");

    const stream = this.client.messages.stream({
      model: options?.model ?? this.defaultModel,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      system: systemMessage?.content,
      messages: userMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        yield chunk.delta.text;
      }
    }
  }
}

// ─── AWS Bedrock Provider ─────────────────────────────────────────────

export class BedrockProvider implements IAiProvider {
  name: AiProvider = "bedrock";
  private client: BedrockRuntimeClient;
  private defaultModel: string;

  constructor(
    apiKey?: string,
    model = "anthropic.claude-3-5-sonnet-20241022-v2:0",
  ) {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION ?? "us-east-1",
      credentials: fromEnv(),
    });
    this.defaultModel = model;
  }

  async generateCompletion(
    messages: ChatMessage[],
    options?: CompletionOptions,
  ): Promise<CompletionResult> {
    const systemMessage = messages.find((m) => m.role === "system");
    const userMessages = messages.filter((m) => m.role !== "system");

    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      system: systemMessage?.content,
      messages: userMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const command = new InvokeModelCommand({
      modelId: options?.model ?? this.defaultModel,
      body,
      contentType: "application/json",
    });

    const response = await this.client.send(command);
    const responseBody = JSON.parse(
      new TextDecoder().decode(response.body),
    ) as {
      content: Array<{ type: string; text: string }>;
      usage: { input_tokens: number; output_tokens: number };
    };

    const content = responseBody.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("");

    return {
      content,
      usage: {
        promptTokens: responseBody.usage?.input_tokens ?? 0,
        completionTokens: responseBody.usage?.output_tokens ?? 0,
      },
    };
  }

  async *streamCompletion(
    messages: ChatMessage[],
    options?: CompletionOptions,
  ): AsyncGenerator<string> {
    // Bedrock streaming would use InvokeModelWithResponseStreamCommand
    // For now, fall back to non-streaming
    const result = await this.generateCompletion(messages, options);
    yield result.content;
  }
}

// ─── Provider Factory ─────────────────────────────────────────────────

export function createAiProvider(
  provider: AiProvider,
  apiKey: string,
  model?: string,
): IAiProvider {
  switch (provider) {
    case "openai":
      return new OpenAIProvider(apiKey, model);
    case "anthropic":
      return new AnthropicProvider(apiKey, model);
    case "bedrock":
      return new BedrockProvider(apiKey, model);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

export function getProviderFromEnv(): IAiProvider {
  const provider = (process.env.AI_PROVIDER ?? "openai") as AiProvider;
  const apiKey =
    process.env.OPENAI_API_KEY ??
    process.env.ANTHROPIC_API_KEY ??
    process.env.AWS_ACCESS_KEY_ID ??
    "";
  const model =
    process.env.AI_MODEL ??
    (provider === "openai"
      ? "gpt-4o"
      : provider === "anthropic"
        ? "claude-sonnet-4-20250514"
        : "anthropic.claude-3-5-sonnet-20241022-v2:0");

  return createAiProvider(provider, apiKey, model);
}
