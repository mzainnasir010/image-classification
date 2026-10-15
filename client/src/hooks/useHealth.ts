import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "../api/endpoints";
import { env } from "../config/env";
import type { HealthResponse } from "../api/types";

export type ApiStatus = "online" | "starting" | "offline";

export interface HealthState {
  status: ApiStatus;
  data: HealthResponse | undefined;
  isLoading: boolean;
}

export function useHealth(): HealthState {
  const { data, isLoading, isError } = useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: ({ signal }) => fetchHealth(signal),
    refetchInterval: env.VITE_HEALTH_POLL_MS,
    refetchIntervalInBackground: true,
    retry: 1,
    retryDelay: 2000,
  });

  let status: ApiStatus = "offline";
  if (!isLoading && !isError && data) {
    status = data.model_loaded ? "online" : "starting";
  }

  return { status, data, isLoading };
}
