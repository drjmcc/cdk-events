import * as sns from "aws-cdk-lib/aws-sns";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Duration, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RedirectsProcessingEventStackProps } from "./redirects-processing-event-stack-props";
import { Architecture } from "aws-cdk-lib/aws-lambda";

export class RedirectsProcessingEventStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: RedirectsProcessingEventStackProps
  ) {
    super(scope, id, props);

    const redirectsServiceTopic = new sns.Topic(this, "RedirectsServiceTopic", {
      displayName: "RedirectsServiceTopic",
    });

    const redirectsToFastlyProcessingDLQ = new sqs.Queue(
      this,
      "redirectsToFastlyProcessingDLQ",
      {
        queueName: "redirectsToFastlyProcessingDLQ",
      }
    );

    const redirectsToFastlyProcessingQueue = new sqs.Queue(
      this,
      "RedirectsFastlyProcessingQueue",
      {
        queueName: "RedirectsFastlyProcessingQueue",
        deadLetterQueue: {
          queue: redirectsToFastlyProcessingDLQ,
          maxReceiveCount: 3,
        },
      }
    );

    redirectsServiceTopic.addSubscription(
      new subscriptions.SqsSubscription(redirectsToFastlyProcessingQueue, {
        rawMessageDelivery: true,
      })
    );

    const redirectsToFastlyProcessor = new NodejsFunction(
      this,
      props.config.redirectsProcessingEventProcessor.LAMBDA_NAME,
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: "./lib/lambda/fastly-redirect/processor.js",
        handler: "handler",
        functionName:
          props.config.redirectsProcessingEventProcessor.LAMBDA_NAME,
        description: "Processes events from redirects service into Fastly.",
        environment: props.config.redirectsProcessingEventProcessor as any,
        memorySize: 256,
        bundling: {
          externalModules: ["aws-sdk"],
        },
        architecture: Architecture.ARM_64,
        timeout: Duration.seconds(30),
      }
    );

    redirectsToFastlyProcessor.addEventSource(
      new SqsEventSource(redirectsToFastlyProcessingQueue, {
        batchSize: 10,
        reportBatchItemFailures: true,
      })
    );
  }
}
