import { Command, flags } from "@oclif/command";
import Listr from "listr";
import * as AWS from "aws-sdk";
import * as inquirer from "inquirer";
import { MessageList } from "aws-sdk/clients/sqs";
import getAllMessages from "../utils/getAllMessages";
import requeueAll from "../utils/requeueAll";
import { boolean } from "@oclif/command/lib/flags";

interface TasksContext {
  queue: string;
  queueUrl?: string;
  dlq?: string;
  dlqUrl?: string;
  region: string;
  messages?: MessageList;
}

interface InitializedContext extends TasksContext {
  queueUrl: string;
  dlq: string;
  dlqUrl: string;
  messages: MessageList;
}

export default class Requeue extends Command {
  static description = "Requeues all messages on the given queue's DLQ";

  static flags = {
    help: flags.help({ char: "h" }),
    region: flags.string({
      char: "r",
      description: "AWS region to execute command in",
      default: "us-east-1"
    })
  };

  static args = [{ name: "queue", required: false }];

  async run() {
    const { args, flags } = this.parse(Requeue);

    let config: AWS.SQS.ClientConfiguration = { apiVersion: "2012-11-05" };

    if (flags.region) {
      config.region = flags.region;
    }

    const sqs = new AWS.SQS(config);

    let params: TasksContext = {
      region: flags.region,
      queue: args.queue
    };

    if (!params.queue) {
      const availableQueues = await sqs.listQueues().promise();

      const result = await inquirer.prompt([
        {
          type: "list",
          name: "queue",
          choices: availableQueues.QueueUrls?.map(url => ({
            name: url,
            value: url
          }))
        }
      ]);

      params.queueUrl = result.queue;
    }

    const tasks = new Listr<TasksContext>([
      {
        title: `Get queue details`,
        async task(ctx) {
          if (!ctx.queueUrl) {
            ctx.queueUrl = await getQueueUrl(sqs, ctx.queue);
          }

          const dlqInfo = await sqs
            .getQueueAttributes({
              QueueUrl: ctx.queueUrl,
              AttributeNames: ["RedrivePolicy"]
            })
            .promise();

          if (!dlqInfo?.Attributes?.RedrivePolicy) {
            throw new Error(
              `Could not find dead letter queue information for ${ctx.queueUrl}`
            );
          }

          const redrivePolicy = JSON.parse(dlqInfo.Attributes.RedrivePolicy);

          let deadLetterTargetArn: string = redrivePolicy.deadLetterTargetArn;

          ctx.dlq = deadLetterTargetArn.substring(
            deadLetterTargetArn.lastIndexOf(":") + 1
          );

          ctx.dlqUrl = await getQueueUrl(sqs, ctx.dlq);
        }
      },
      {
        title: `Get messages from Dead Letter Queue`,
        async task(ctx: InitializedContext) {
          ctx.messages = await getAllMessages(sqs, ctx.dlqUrl);
        }
      },
      {
        title: `Requeue all messages`,
        async task(ctx: InitializedContext) {
          let result = await requeueAll(sqs, ctx.queueUrl, ctx.messages);

          await Promise.all(
            result.Successful.map(
              message =>
                ctx.messages.find(
                  x => message.Id === x.MessageId?.replace(/-/g, "")
                )?.ReceiptHandle
            )
              // @ts-ignore
              .map((ReceiptHandle: string) =>
                sqs
                  .deleteMessage({
                    QueueUrl: ctx.dlqUrl,
                    ReceiptHandle
                  })
                  .promise()
              )
          );
        }
      }
    ]);

    return tasks.run(params);
  }
}
async function getQueueUrl(sqs: AWS.SQS, queue: string) {
  let queueUrl = await sqs
    .getQueueUrl({
      QueueName: queue
    })
    .promise();
  if (!queueUrl.QueueUrl) {
    throw new Error(`Could not find url for queue ${queue}`);
  }
  return queueUrl.QueueUrl;
}
