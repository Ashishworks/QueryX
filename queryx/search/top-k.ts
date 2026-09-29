import type { RankedDocument } from "./ranking";

class MinHeap {
  private heap: RankedDocument[] = [];

  get size(): number {
    return this.heap.length;
  }

  peek(): RankedDocument | undefined {
    return this.heap[0];
  }

  push(item: RankedDocument): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): RankedDocument | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const minimum = this.heap[0];
    const last = this.heap.pop()!;

    this.heap[0] = last;
    this.bubbleDown(0);

    return minimum;
  }

  toArray(): RankedDocument[] {
    return [...this.heap];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.heap[parent].score <= this.heap[index].score) {
        break;
      }

      [this.heap[parent], this.heap[index]] = [
        this.heap[index],
        this.heap[parent],
      ];

      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;

      let smallest = index;

      if (
        left < this.heap.length &&
        this.heap[left].score < this.heap[smallest].score
      ) {
        smallest = left;
      }

      if (
        right < this.heap.length &&
        this.heap[right].score < this.heap[smallest].score
      ) {
        smallest = right;
      }

      if (smallest === index) {
        break;
      }

      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];

      index = smallest;
    }
  }
}

export function getTopK(
  documents: RankedDocument[],
  k: number
): RankedDocument[] {
  if (k <= 0) {
    return [];
  }

  const heap = new MinHeap();

  for (const document of documents) {
    heap.push(document);

    if (heap.size > k) {
      heap.pop();
    }
  }

  return heap
    .toArray()
    .sort((a, b) => b.score - a.score);
}