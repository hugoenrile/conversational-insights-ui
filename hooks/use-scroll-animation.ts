"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

export function useScrollAnimation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: "-100px 0px -100px 0px" 
  });

  return { ref, isInView };
}
