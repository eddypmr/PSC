const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'server-app',
  brokers: ['localhost:9092'],
});

const serverProducer = kafka.producer();

const runServerProducer = async () => {
  await serverProducer.connect();
};

const serverConsumer = kafka.consumer({ groupId: 'server-group' });

const runServerConsumer = async () => {
  await serverConsumer.connect();
  await serverConsumer.subscribe({ topic: 'chat', fromBeginning: false });

  await serverConsumer.run({
    eachMessage: async (message:any) => {
      // Manejar el mensaje recibido del cliente
      console.log(`Mensaje del cliente: ${message.value}`);
    },
  });
};

runServerProducer().catch(console.error);
runServerConsumer().catch(console.error);

module.exports = {
  serverProducer,
};
