"use client";

import { Lottie } from "lottie-react";
import noResult2 from "@/assets/animations/noResult2.json";

export default function NoResult2Icon() {
  return (
    <Lottie
      src={noResult2}
      loop
      autoplay
      className="h-12 w-12"
    />
  );
}