"use client";

import { Lottie } from "lottie-react";
import loading from "@/assets/animations/loading.json";

export default function LoadingIcon() {
  return (
    <Lottie
      src={loading}
      loop
      autoplay
      className="h-12 w-12"
    />
  );
}