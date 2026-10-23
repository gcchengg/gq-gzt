import { useSyncExternalStore } from "react";
import { CONFIG_KEY, normalizeConfig, validateConfig } from "./config";
function readConfig() {
  try {
    return normalizeConfig(JSON.parse(localStorage.getItem(CONFIG_KEY)) || {});
  } catch {
    return normalizeConfig();
  }
}
let config = readConfig();
const listeners = new Set();
window.addEventListener("storage", (event) => {
  if (event.key === CONFIG_KEY) {
    config = readConfig();
    listeners.forEach((fn) => fn());
  }
});
export const getExpertConfig = () => config;
export function saveExpertConfig(next) {
  validateConfig(next);
  const saved = normalizeConfig({ ...next, version: config.version + 1 });
  saved.fees = saved.fees.map((fee) => ({ ...fee, version: saved.version }));
  localStorage.setItem(CONFIG_KEY, JSON.stringify(saved));
  config = saved;
  listeners.forEach((fn) => fn());
  return saved;
}
export function useExpertConfig() {
  return useSyncExternalStore((fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, getExpertConfig);
}
