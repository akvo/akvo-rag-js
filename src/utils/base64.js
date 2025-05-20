export function cleanBase64(str) {
  if (!str) return "";
  const removeUnusedStr = str.split(":")[1].trim().replace(/^"|"$/g, "");
  const match = removeUnusedStr.match(/[A-Za-z0-9+/=]+/);
  return match ? match[0] : "";
}
