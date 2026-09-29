import {
  addDocument,
  type InvertedIndex,
} from "./inverted-index";

import { tokenize } from "./tokenizer";

const index: InvertedIndex = new Map();

const title = tokenize("React Hooks");

const headings = tokenize(
  "Learn React Hooks"
);

const body = tokenize(
  "React hooks let you use state and other React features."
);

addDocument(
  index,
  1,
  title,
  headings,
  body
);

console.log(
  JSON.stringify(
    Object.fromEntries(index),
    null,
    2
  )
);  