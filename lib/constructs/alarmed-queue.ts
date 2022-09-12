import * as sqs from "aws-cdk-lib/aws-sqs";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudwatchActions from "aws-cdk-lib/aws-cloudwatch-actions";
import { AlarmedQueueProps } from "./alarmed-queue-props";
import { Construct } from "constructs";

export class AlarmedQueue extends Construct {
  public queue: sqs.Queue;
  public alarm: cloudwatch.Alarm;

  constructor(scope: Construct, id: string, props: AlarmedQueueProps) {
    super(scope, id);

    this.queue = new sqs.Queue(this, "Queue", props.queueProps);

    this.alarm = new cloudwatch.Alarm(this, "Alarm", {
      metric: this.queue.metricApproximateNumberOfMessagesVisible(),
      threshold: props.alarmThreshold,
      evaluationPeriods: props.alarmEvaluationPeriods,
      datapointsToAlarm: props.alarmDatapointsToAlarm,
    });

    this.alarm.addAlarmAction(
      new cloudwatchActions.SnsAction(props.alarmTopic)
    );
    this.alarm.addOkAction(new cloudwatchActions.SnsAction(props.alarmTopic));
  }
}
