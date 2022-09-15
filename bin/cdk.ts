#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as config from "../lib/config";
import { Config } from "../lib/config/config";
import { RedirectsInboundEventStack } from "../lib/stacks/redirects-inbound-event-stack";
import { RedirectsProcessingEventStack } from "../lib/stacks/redirects-processing-event-stack";

const app = new cdk.App();

const createStacks = (config: Config) => {
  new RedirectsInboundEventStack(
    app,
    `${config.outputPrefix}RedirectsInboundEventStack`,
    {
      env: {
        region: config.awsRegion,
        account: config.awsAccountNumber,
      },
      tags: {
        Application: "Redirects",
        Environment: config.outputPrefix,
      },
      config: config,
    }
  );

  new RedirectsProcessingEventStack(
    app,
    `${config.outputPrefix}RedirectsProcessingEventStack`,
    {
      env: {
        region: config.awsRegion,
        account: config.awsAccountNumber,
      },
      tags: {
        Application: "Redirects",
        Environment: config.outputPrefix,
      },
      config: config,
    }
  );
};

createStacks(config.dev);
app.synth();
