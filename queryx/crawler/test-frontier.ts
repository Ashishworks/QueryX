import { CrawlFrontier } from "./frontier";

const frontier = new CrawlFrontier();

console.log("Initial size:", frontier.size);

console.log(
  "Add A:",
  frontier.add({
    url: "https://react.dev",
    depth: 0,
  })
);

console.log(
  "Add B:",
  frontier.add({
    url: "https://react.dev/learn",
    depth: 1,
  })
);

console.log(
  "Add duplicate A:",
  frontier.add({
    url: "https://react.dev",
    depth: 0,
  })
);

console.log("Size:", frontier.size);

console.log("Next:", frontier.next());
console.log("Next:", frontier.next());
console.log("Next:", frontier.next());

console.log("Is empty:", frontier.isEmpty);