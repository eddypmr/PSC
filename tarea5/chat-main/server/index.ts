import { Kafka, Consumer, Producer, EachMessagePayload } from 'kafkajs';
import { v4 } from 'uuid';
import { Message } from './models/Message';

const kafka = new Kafka({
  clientId: 'chat-app',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'chat-group' });
const producer = kafka.producer();

const PORT = 8000;

interface User {
  id: string;
  name: string;
}

const users: { [id: string]: User } = {};
const messages: Message[] = [];

async function main() {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: 'chat', fromBeginning: false });

  console.log('Server running');

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      const data = JSON.parse(message.value!.toString('utf8'));

      if (data.name) {
        const user: User = {
          id: v4(),
          name: data.name,
        };

        console.log('New user joined', user.name);

        users[user.id] = user;

        const adminMessage: Message = {
          from: 'admin',
          text: `New user connected ${user.name}`,
          timestamp: Date.now(),
        };

        messages.push(adminMessage);
        await sendMessage(adminMessage);

        for (const m of messages) {
          await sendMessage(m, user.id);
        }
      }

      if (data.text) {
        const user = users[data.from];
        const message: Message = {
          from: user.name,
          text: data.text,
          timestamp: Date.now(),
        };

        console.log(`New message from ${user.name}`, data.text);
        messages.push(message);
        await sendMessage(message);
      }
    },
  });

  // Implementar el código del productor para enviar mensajes aquí

  // Resto del código del servidor
}

async function sendMessage(message: Message, to: string = 'all') {
  if (to === 'all') {
    const user = users[message.from];
    const promises = Object.values(users)
      .filter(u => u.id !== user.id)
      .map(u => producer.send({
        topic: 'chat',
        messages: [{ value: JSON.stringify(message), key: u.id }],
      }));

    await Promise.all(promises);
  } else {
    const targetUser = users[to];
    await producer.send({
      topic: 'chat',
      messages: [{ value: JSON.stringify(message), key: targetUser.id }],
    });
  }
}

main().catch(console.error);
