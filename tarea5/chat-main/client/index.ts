import { Kafka, Producer, Consumer } from 'kafkajs';
import { createInterface } from 'readline';
import { Message } from '../server/models/Message';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const kafka = new Kafka({
  clientId: 'client-app',
  brokers: ['localhost:9092'],
});

const clientProducer: Producer = kafka.producer();

const runClientProducer = async (name: string, text: string): Promise<void> => {
  await clientProducer.connect();
  await clientProducer.send({
    topic: 'chat',
    messages: [
      {
        key: name,
        value: JSON.stringify({ name, text }),
      },
    ],
  });
  await clientProducer.disconnect();
};

const clientConsumer: Consumer = kafka.consumer({ groupId: 'client-group' });

const runClientConsumer = async (): Promise<void> => {
  await clientConsumer.connect();
  await clientConsumer.subscribe({ topic: 'chat', fromBeginning: false });

  await clientConsumer.run({
    eachMessage: async ({ message }): Promise<void> => {
      const messageData = JSON.parse(message.value!.toString('utf8')) as { name: string, text: string };
      printMessage({
        from: messageData.name,
        text: messageData.text,
        timestamp: Date.now(), // Cambia por el timestamp real si lo necesitas
      });
    },
  });
};

function main() {
  const name = process.argv[2];
  
  runClientProducer(name, ''); // Conectar al productor

  rl.on('line', (input) => {
    runClientProducer(name, input); // Enviar mensaje al Kafka topic 'chat'
  });

  runClientConsumer(); // Conectar al consumidor
}

main();

function printMessage(message: Message) {
  console.log(`${timestampTohhmm(message.timestamp)} ${message.from}: ${message.text}`);
}

function timestampTohhmm(timestamp: number): string {
  const date = new Date(timestamp);
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');

  return `${hh}:${mm}`;
}
