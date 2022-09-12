import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import { StackProps } from "aws-cdk-lib";

export interface AlarmedQueueProps extends StackProps {
  queueProps: sqs.QueueProps;
  alarmThreshold: number;
  alarmEvaluationPeriods: number;
  alarmDatapointsToAlarm: number;
  alarmTopic: sns.ITopic;
}
