function readAllDirectoryEntries(
  reader: FileSystemDirectoryReader,
): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    const entries: FileSystemEntry[] = [];
    const readBatch = () => {
      reader.readEntries(
        (batch) => {
          if (batch.length === 0) {
            resolve(entries);
            return;
          }
          entries.push(...batch);
          readBatch();
        },
        reject,
      );
    };
    readBatch();
  });
}

function fileFromEntry(
  entry: FileSystemFileEntry,
  relativePath: string,
): Promise<File> {
  return new Promise((resolve, reject) => {
    entry.file(
      (file) => {
        Object.defineProperty(file, "webkitRelativePath", {
          value: relativePath,
          configurable: true,
        });
        resolve(file);
      },
      reject,
    );
  });
}

async function collectFromEntry(
  entry: FileSystemEntry,
  pathPrefix: string,
): Promise<File[]> {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    const relativePath = pathPrefix
      ? `${pathPrefix}/${entry.name}`
      : entry.name;
    const file = await fileFromEntry(fileEntry, relativePath);
    return [file];
  }

  if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const reader = dirEntry.createReader();
    const children = await readAllDirectoryEntries(reader);
    const nextPrefix = pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name;
    const nested = await Promise.all(
      children.map((child) => collectFromEntry(child, nextPrefix)),
    );
    return nested.flat();
  }

  return [];
}

/** Collect all files from a drop event, including nested folders when supported. */
export async function collectFilesFromDataTransfer(
  dataTransfer: DataTransfer,
): Promise<File[]> {
  const items = dataTransfer.items;
  if (items && items.length > 0) {
    const fromEntries: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind !== "file") continue;
      const entry = item.webkitGetAsEntry?.();
      if (entry) {
        fromEntries.push(...(await collectFromEntry(entry, "")));
      } else {
        const file = item.getAsFile();
        if (file) fromEntries.push(file);
      }
    }
    if (fromEntries.length > 0) {
      return fromEntries;
    }
  }

  return Array.from(dataTransfer.files);
}
