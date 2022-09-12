/* eslint-disable @typescript-eslint/no-explicit-any */
import deepmerge from "deepmerge";

export declare enum Environment {
  UNITTEST = 0,
  DEVELOPMENT = 1,
  PRODUCTION = 2,
}

export interface Config {
  environment: Environment;
  awsAccountNumber: string;
  awsRegion: string;
  outputPrefix: string;
  redirectsInboundEventProcessor: LambdaConfig;
  redirectsProcessingEventProcessor: LambdaConfig;
}

export interface LambdaConfig {
  LAMBDA_NAME: string;
  RELEASE_VERSION: string;
  ENVIRONMENT_NAME: string;
}

export const mergeConfig = (config: any, additionalValues: any = {}): any => {
  return deepmerge(config.environmentVariables, additionalValues);
};
