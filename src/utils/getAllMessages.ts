import { SQS } from "aws-sdk";
import { MessageList } from "aws-sdk/clients/sqs";

export default async (sqs: SQS, QueueUrl: string): Promise<MessageList> => {
  let result: MessageList = [];

  while (true) {
    const newMessages = await sqs
      .receiveMessage({
        QueueUrl,
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 30
      })
      .promise();

    if (!newMessages.Messages?.length) break;

    result.push(...newMessages.Messages);
  }

  return result;
};
