"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";

export function DotBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 h-full w-full bg-background group"
    >
      <div className="absolute h-full w-full bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-40 pointer-events-none" />
    </div>
  );
}
