import {
  normalizeText,
  tokenize,
} from "./tokenizer";

const text = `
  React Hooks are AWESOME!
  Learn React from https://react.dev/learn.
`;

console.log("Original:");
console.log(text);

console.log("\nNormalized:");
console.log(normalizeText(text));

console.log("\nTokens:");
console.log(tokenize(text));