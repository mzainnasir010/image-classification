import { useQuery } from "@tanstack/react-query";
import { fetchModelInfo } from "../api/endpoints";
import type { ModelInfoResponse } from "../api/types";

export function useModelInfo() {
  return useQuery<ModelInfoResponse>({
    queryKey: ["model-info"],
    queryFn: ({ signal }) => fetchModelInfo(signal),
    staleTime: 5 * 60 * 1000, // 5 min — model info rarely changes
    retry: (count, error) => {
      // Don't retry 4xx — only network errors
      if (error instanceof Error && "status" in error) {
        const status = (error as { status: number }).status;
        if (status >= 400 && status < 500) return false;
      }
      return count < 2;
    },
  });
}
