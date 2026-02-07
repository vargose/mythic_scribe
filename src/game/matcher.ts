/**
 * Fuzzy matching algorithm for finding items in data dictionaries
 * Implements 3-tier matching: exact -> partial -> word-based
 */

interface MatchableItem {
  name: string;
  [key: string]: any;
}

type MatchResult<T> = [string | null, T | null];

export function findMatch<T extends MatchableItem>(
  inputName: string,
  dataDict: Record<string, T>
): MatchResult<T> {
  const inputNameLower = inputName.toLowerCase().trim();

  if (!inputNameLower) {
    return [null, null];
  }

  // 1. Exact match on name or key
  for (const [key, item] of Object.entries(dataDict)) {
    const itemNameLower = item.name.toLowerCase();
    const keyLower = key.toLowerCase();
    const keyWithSpaces = key.replace(/_/g, ' ').toLowerCase();

    if (inputNameLower === itemNameLower || inputNameLower === keyLower || inputNameLower === keyWithSpaces) {
      return [key, item];
    }
  }

  // 2. Partial substring match
  for (const [key, item] of Object.entries(dataDict)) {
    const itemNameLower = item.name.toLowerCase();
    const keyWithSpaces = key.replace(/_/g, ' ').toLowerCase();

    if (itemNameLower.includes(inputNameLower) || keyWithSpaces.includes(inputNameLower)) {
      return [key, item];
    }
  }

  // 3. Word-based fuzzy match (all words from input must be present in target)
  const inputWords = inputNameLower.split(/\s+/).filter(word => word.length > 0);

  if (inputWords.length > 0) {
    for (const [key, item] of Object.entries(dataDict)) {
      const itemNameLower = item.name.toLowerCase();
      const keyWithSpaces = key.replace(/_/g, ' ').toLowerCase();

      // Check if all input words are in item name
      const allWordsInName = inputWords.every(word => itemNameLower.includes(word));
      if (allWordsInName) {
        return [key, item];
      }

      // Check if all input words are in key
      const allWordsInKey = inputWords.every(word => keyWithSpaces.includes(word));
      if (allWordsInKey) {
        return [key, item];
      }
    }
  }

  return [null, null];
}
