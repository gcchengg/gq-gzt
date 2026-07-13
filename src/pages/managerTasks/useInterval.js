import { useEffect, useRef } from "react";

export function useInterval(callback, delay) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const timerRef = useRef();
  useEffect(() => {
    timerRef.current = window.setInterval(() => callbackRef.current(), delay);
    return () => window.clearInterval(timerRef.current);
  }, [delay]);
  return () => window.clearInterval(timerRef.current);
}
