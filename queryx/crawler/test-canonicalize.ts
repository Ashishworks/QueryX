import { canonicalizeUrl } from "./canonicalize";

const tests = [
  "https://react.dev/learn/",
  "https://react.dev/learn#hooks",
  "https://react.dev/learn?utm_source=google",
  "/learn",
  "javascript:void(0)",
];

for (const test of tests) {
  console.log(test, "→", canonicalizeUrl(test, "https://react.dev"));
}