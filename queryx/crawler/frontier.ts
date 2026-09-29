import type { CrawlTask } from "./types";

export class CrawlFrontier {
  private queue: CrawlTask[] = [];
  private head = 0;

  private discovered = new Set<string>();

  add(task: CrawlTask): boolean {
    if (this.discovered.has(task.url)) {
      return false;
    }

    this.discovered.add(task.url);
    this.queue.push(task);

    return true;
  }

  next(): CrawlTask | null {
    if (this.head >= this.queue.length) {
      return null;
    }

    const task = this.queue[this.head];
    this.head++;

    return task;
  }

  has(url: string): boolean {
    return this.discovered.has(url);
  }

  get size(): number {
    return this.queue.length - this.head;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }
}