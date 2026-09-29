export type Posting = {
  docId: number;
  titleTF: number;
  headingTF: number;
  bodyTF: number;
};

export type InvertedIndex = Map<string, Posting[]>;

function countTerms(tokens: string[]): Map<string, number> {
  const frequencies = new Map<string, number>();

  for (const token of tokens) {
    frequencies.set(
      token,
      (frequencies.get(token) ?? 0) + 1
    );
  }

  return frequencies;
}

export function addDocument(
  index: InvertedIndex,
  docId: number,
  titleTokens: string[],
  headingTokens: string[],
  bodyTokens: string[]
): void {
  const titleFrequency = countTerms(titleTokens);
  const headingFrequency = countTerms(headingTokens);
  const bodyFrequency = countTerms(bodyTokens);

  const terms = new Set([
    ...titleFrequency.keys(),
    ...headingFrequency.keys(),
    ...bodyFrequency.keys(),
  ]);

  for (const term of terms) {
    const posting: Posting = {
      docId,
      titleTF: titleFrequency.get(term) ?? 0,
      headingTF: headingFrequency.get(term) ?? 0,
      bodyTF: bodyFrequency.get(term) ?? 0,
    };

    const postings = index.get(term) ?? [];

    postings.push(posting);

    index.set(term, postings);
  }
}