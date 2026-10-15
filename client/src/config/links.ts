import { env } from "./env";

export const links = {
  github: env.VITE_GITHUB_URL,
  notebook: "",
  datasetSource: "https://www.kaggle.com/datasets/puneet6060/intel-image-classification",
} as const;
