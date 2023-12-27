import { WebSocket } from 'ws';
import { createInterface } from 'readline';
import { Message } from '../server/models/Message';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function main() {
  const name = process.argv[2];
  const ws = new WebSocket('ws://localhost:8000');

  ws.on('open', () => {
    ws.send(JSON.stringify({
      name
    }));

    rl.on('line', (input) => {
      ws.send(JSON.stringify({
        text: input
      }));
    });
  });

  ws.on('message', raw => {
    const message = JSON.parse(raw.toString('utf8'));
    printMessage(message);
  });
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
