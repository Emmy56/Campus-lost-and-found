export function jaroDistance(s1, s2) {
  if (s1 === s2) return 1.0;

  const len1 = s1.length;
  const len2 = s2.length;

  if (len1 === 0 || len2 === 0) return 0.0;

  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);

    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const m = matches;
  return (m / len1 + m / len2 + (m - transpositions / 2) / m) / 3.0;
}

export function jaroWinklerSimilarity(str1, str2) {
  const s1 = (str1 || '').toLowerCase().trim();
  const s2 = (str2 || '').toLowerCase().trim();

  const jaroScore = jaroDistance(s1, s2);
  if (jaroScore < 0.7) return jaroScore;

  let prefix = 0;
  const maxPrefix = 4;
  for (let i = 0; i < Math.min(s1.length, s2.length, maxPrefix); i++) {
    if (s1[i] === s2[i]) {
      prefix++;
    } else {
      break;
    }
  }

  const p = 0.1;
  return jaroScore + prefix * p * (1 - jaroScore);
}

export function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function computeItemMatchScore(newItem, targetItem) {
  if (newItem.category !== targetItem.category && newItem.category !== 'Others' && targetItem.category !== 'Others') {
    return 0;
  }

  const text1 = normalizeText(`${newItem.title} ${newItem.description} ${newItem.location}`);
  const text2 = normalizeText(`${targetItem.title} ${targetItem.description} ${targetItem.location}`);

  const jwScore = jaroWinklerSimilarity(text1, text2);
  const locationBonus = (newItem.location || '').toLowerCase() === (targetItem.location || '').toLowerCase() ? 0.1 : 0;

  return Math.round(Math.min(1.0, jwScore + locationBonus) * 100);
}
