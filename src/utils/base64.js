export function cleanBase64(str) {
  if (!str) return "";
  const match = str.match(/[A-Za-z0-9+/=]+/);
  return match ? match[0] : "";
}
