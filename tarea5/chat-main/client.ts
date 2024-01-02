import { Kafka, logLevel } from 'kafkajs';
import { createInterface } from 'readline';

const TOPIC = 'test4';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const kafka = new Kafka({
  clientId: 'chat-app',
  brokers: ['127.0.0.1:9092'],
  // logLevel: logLevel.NOTHING
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'chat-group' });

async function main() {
  const name = process.argv[2];

  subscribe();

  process.on('beforeExit', async () => {
    await consumer.disconnect();
    await producer.disconnect();
  });

  async function subscribe() {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (message.value) {
          const data = JSON.parse(message.value.toString());
          if (data.from !== name) {
            console.log(`${data.from}: ${data.text}`);
          }
        }
      },
    });

    rl.on('line', async (input) => {
      sendMessage(input);
    });
  }

  async function sendMessage(text: string) {
    const message = {
      from: name,
      text
    }
    await producer.send({
      topic: TOPIC,
      messages: [
        { value: JSON.stringify(message) },
      ],
    });
  }
}

main();
