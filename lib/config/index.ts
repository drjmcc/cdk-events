import { Config } from "./config";
import deepmerge from "deepmerge";
import * as devSpecificConfig from "./dev.json";
import * as production1SpecificConfig from "./production1.json";
import * as sharedConfig from "./shared.json";

export const dev: Config = deepmerge(sharedConfig, devSpecificConfig);
export const production1: Config = deepmerge(
  sharedConfig,
  production1SpecificConfig
);
