import { Kafka, logLevel } from 'kafkajs';

const TOPIC = 'test4';

const kafka = new Kafka({
  clientId: 'chat-app',
  brokers: ['127.0.0.1:9092'],
  // logLevel: logLevel.NOTHING
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'chat-group' });

async function main() {
  await producer.connect();

  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

  console.log('running chat server');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message.value) {
        console.log(message.value.toString());
        const data = JSON.parse(message.value.toString());

        if (data.text) {
          await sendMessage({
            from: data.from,
            text: data.text
          })
        }
      }
    },
  });

  process.on('beforeExit', async () => {
    await consumer.disconnect();
    await producer.disconnect();
  });

  async function sendMessage(message: { from: string; text: string }) {
    await producer.send({
      topic: TOPIC,
      messages: [
        {
          value: JSON.stringify({
            from: message.from,
            text: message.text
          })
        },
      ],
    });
  }
}

main();
