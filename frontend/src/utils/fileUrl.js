export function getFileUrl(filePath) {
  if (!filePath) return "";
  try {
    return new URL(filePath, import.meta.env.VITE_API_URL || window.location.origin).toString();
  } catch {
    return filePath;
  }
}
