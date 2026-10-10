type TrieNode = {
  children: Map<string, TrieNode>;
  isWord: boolean;
};

export class Trie {
  private root: TrieNode;

  constructor() {
    this.root = {
      children: new Map(),
      isWord: false,
    };
  }

  insert(word: string): void {
    let node = this.root;

    for (const char of word) {
      let child = node.children.get(char);

      if (!child) {
        child = {
          children: new Map(),
          isWord: false,
        };

        node.children.set(char, child);
      }

      node = child;
    }

    node.isWord = true;
  }

  suggest(prefix: string, limit: number): string[] {
    if (!prefix || limit <= 0) {
      return [];
    }

    let node = this.root;

    for (const char of prefix) {
      const child = node.children.get(char);

      if (!child) {
        return [];
      }

      node = child;
    }

    const suggestions: string[] = [];

    this.collectWords(
      node,
      prefix,
      suggestions,
      limit
    );

    return suggestions;
  }

  private collectWords(
    node: TrieNode,
    current: string,
    suggestions: string[],
    limit: number
  ): void {
    if (suggestions.length >= limit) {
      return;
    }

    if (node.isWord) {
      suggestions.push(current);
    }

    for (const [char, child] of node.children) {
      if (suggestions.length >= limit) {
        return;
      }

      this.collectWords(
        child,
        current + char,
        suggestions,
        limit
      );
    }
  }
}