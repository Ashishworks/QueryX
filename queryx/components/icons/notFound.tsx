"use client";

import { Lottie } from "lottie-react";
import notFound from "@/assets/animations/notFound.json";

export default function NotFoundIcon() {
  return (
    <Lottie
      src={notFound}
      loop
      autoplay
      className="h-12 w-12"
    />
  );
}
