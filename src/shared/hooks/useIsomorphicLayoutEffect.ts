import { useLayoutEffect, useEffect } from "react";

/**
 * A custom hook that provides useLayoutEffect in the browser
 * and useEffect during SSR to avoid warnings.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
