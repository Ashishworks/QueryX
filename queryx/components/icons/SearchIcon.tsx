"use client";

import { Lottie } from "lottie-react";
import searchAnimation from "@/assets/animations/SearchIt.json";

export default function SearchIcon() {
  return (
    <Lottie
      src={searchAnimation}
      loop
      autoplay
      className="h-12 w-12"
    />
  );
}