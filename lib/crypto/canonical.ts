/**
 * Deterministic JSON Canonicalization Algorithm
 * Sorts object keys recursively to ensure consistent serialization for SHA-256 hashing.
 */
export function canonicalize(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalize(item)).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const parts: string[] = [];

  for (const key of sortedKeys) {
    if (obj[key] !== undefined) {
      parts.push(JSON.stringify(key) + ':' + canonicalize(obj[key]));
    }
  }

  return '{' + parts.join(',') + '}';
}
