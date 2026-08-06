export function toWindowsCopyPath(inputPath: string): string {
  const trimmed = inputPath.trimStart();
  let normalized = trimmed.replace(/^[\\/]+/, "");

  if (normalized === "data") {
    normalized = "";
  } else if (normalized.startsWith("data/") || normalized.startsWith("data\\")) {
    normalized = normalized.slice(5);
  }

  normalized = normalized.replace(/^[\\/]+/, "");

  const windowsPath = normalized.replace(/\//g, "\\");
  return `\\${windowsPath}`;
}
