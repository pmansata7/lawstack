-- Fraud-claim fields for client interview / call transcripts (case_transcripts).
-- Safe to run more than once.

ALTER TABLE case_transcripts
  ADD COLUMN IF NOT EXISTS fraud_summary TEXT,
  ADD COLUMN IF NOT EXISTS fraud_elements JSONB;

COMMENT ON COLUMN case_transcripts.fraud_summary IS
  'Plain-language summary of alleged fraudulent misrepresentation from the interview.';
COMMENT ON COLUMN case_transcripts.fraud_elements IS
  'Structured fraud elements (misrepresentation, scienter, reliance, damages) extracted from the transcript.';
