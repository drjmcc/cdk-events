import { StackProps } from "aws-cdk-lib";
import { Config } from "../config/config";

export interface RedirectsInboundEventStackProps extends StackProps {
  config: Config;
}
