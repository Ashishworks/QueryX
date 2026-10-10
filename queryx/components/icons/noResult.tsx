"use client";

import { Lottie } from "lottie-react";
import noResult from "@/assets/animations/noResult.json";

export default function NoResultIcon() {
  return (
    <Lottie
      src={noResult}
      loop
      autoplay
      className="h-12 w-12"
    />
  );
}