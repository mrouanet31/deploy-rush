/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional API key sent as x-api-key when the backend requires auth. */
  readonly VITE_SUBMIT_TOKEN?: string;
}
