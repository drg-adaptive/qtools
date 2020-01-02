import { MessageList } from "aws-sdk/clients/sqs";
import SQS = require("aws-sdk/clients/sqs");

export default async (
  sqs: SQS,
  QueueUrl: string,
  sourceMessages: MessageList
): Promise<SQS.SendMessageBatchResult> => {
  let result: SQS.SendMessageBatchResult = {
    Successful: [],
    Failed: []
  };

  const messages = [...sourceMessages];

  while (messages.length > 0) {
    let tmpMessages = messages.splice(0, Math.min(10, messages.length));

    const insertResult = await sqs
      .sendMessageBatch({
        QueueUrl,
        Entries: tmpMessages.map(
          (
            msg: SQS.Message,
            idx: number
          ): SQS.SendMessageBatchRequestEntry => ({
            Id: msg.MessageId?.replace(/-/g, "") || "",
            MessageAttributes: msg.MessageAttributes,
            MessageBody: msg.Body || ""
          })
        )
      })
      .promise();

    result.Successful.push(...insertResult.Successful);
    result.Failed.push(...insertResult.Failed);
  }

  return result;
};
