import { StackProps } from "aws-cdk-lib";
import { Config } from "../config/config";

export interface RedirectsProcessingEventStackProps extends StackProps {
  config: Config;
}
