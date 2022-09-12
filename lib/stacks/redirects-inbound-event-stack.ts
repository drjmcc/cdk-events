import * as sns from "aws-cdk-lib/aws-sns";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Duration, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RedirectsInboundEventStackProps } from "./redirects-inbound-event-stack-props";
import { Architecture } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class RedirectsInboundEventStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: RedirectsInboundEventStackProps
  ) {
    super(scope, id, props);

    const postsServiceTopic = new sns.Topic(this, "PostsServiceTopic", {
      displayName: "PostsServiceTopic",
    });

    const redirectsProcessingDLQ = new sqs.Queue(
      this,
      "redirectsInboundProcessingDLQ",
      {
        queueName: "redirectsInboundProcessingDLQ",
      }
    );

    const redirectsInboundProcessingQueue = new sqs.Queue(
      this,
      "redirectsInboundProcessingQueue",
      {
        queueName: "redirectsInboundProcessingQueue",
        deadLetterQueue: {
          queue: redirectsProcessingDLQ,
          maxReceiveCount: 3,
        },
      }
    );

    postsServiceTopic.addSubscription(
      new subscriptions.SqsSubscription(redirectsInboundProcessingQueue, {
        rawMessageDelivery: true,
      })
    );

    const redirectsInboundEventsProcessor = new NodejsFunction(
      this,
      props.config.redirectsInboundEventProcessor.LAMBDA_NAME,
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: "./lib/lambda/redirects-inbound/processor.js",
        handler: "handler",
        functionName: props.config.redirectsInboundEventProcessor.LAMBDA_NAME,
        description: "Processes events from post service.",
        environment: props.config.redirectsInboundEventProcessor as any,
        memorySize: 256,
        bundling: {
          externalModules: ["aws-sdk"],
        },
        architecture: Architecture.ARM_64,
        timeout: Duration.seconds(30),
      }
    );
    redirectsInboundEventsProcessor.addEventSource(
      new SqsEventSource(redirectsInboundProcessingQueue, {
        batchSize: 10,
        reportBatchItemFailures: true,
      })
    );
  }
}
