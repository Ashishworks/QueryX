import { generateSnippet } from "./snippets";

const text = `
React Hooks let you use state and other React features
without writing a class. You can create your own Hooks
that let you reuse stateful logic between components.
`;

const snippet = generateSnippet(
  text,
  ["react", "hooks"]
);

console.log("Snippet:");
console.log(snippet);