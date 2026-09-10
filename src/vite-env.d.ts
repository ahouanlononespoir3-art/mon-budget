/// <reference types="vite/client" />

declare module "virtual:pwa-register" {
  interface RegisterSWOptions {
    immediate?: boolean;
  }

  export function registerSW(options?: RegisterSWOptions): () => Promise<void>;
}
