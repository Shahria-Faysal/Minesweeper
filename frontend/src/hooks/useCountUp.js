import { useState, useEffect, useRef } from "react";

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * Returns the current animated value as a string (or the original
 * non-numeric value unchanged, e.g. "—").
 */
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    // If not a real number, skip animation
    const numTarget = parseFloat(target);
    if (target === null || target === undefined || isNaN(numTarget)) {
      setValue(target ?? "—");
      return;
    }

    // Cancel any in-flight animation from a previous target
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quad
      const eased = 1 - (1 - progress) ** 2;
      const current = eased * numTarget;

      // Preserve decimal places if target has them
      const isFloat = String(target).includes(".");
      setValue(isFloat ? current.toFixed(1) : Math.round(current));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target); // land exactly on target
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}
