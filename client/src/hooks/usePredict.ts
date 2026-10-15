import { useMutation } from "@tanstack/react-query";
import { predict } from "../api/endpoints";
import { ApiError } from "../api/errors";
import type { PredictionResponse } from "../api/types";

export interface PredictResult {
  response: PredictionResponse;
  durationMs: number;
}

export function usePredict() {
  return useMutation<PredictResult, ApiError, { file: File; signal?: AbortSignal }>({
    mutationFn: async ({ file, signal }) => {
      const start = performance.now();
      const response = await predict(file, signal);
      const durationMs = Math.round(performance.now() - start);
      return { response, durationMs };
    },
    // Never auto-retry POST requests
    retry: false,
  });
}
