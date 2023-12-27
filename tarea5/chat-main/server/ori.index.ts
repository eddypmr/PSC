import { WebSocket, WebSocketServer } from 'ws';
import { v4 } from 'uuid';
import { Message } from './models/Message';

const PORT = 8000;



interface User {
  id: string;
  name: string;
  ws: WebSocket;
}

function main() {
  const wss = new WebSocketServer({
    port: PORT
  });

  console.log(`server running at port ${PORT}`);

  const users: {[id: string]: User} = {};
  const messages: Message[] = [];

  wss.on('connection', (ws, req) => {
    const id = v4();

    ws.on('message', (raw) => {
      const data = JSON.parse(raw.toString('utf8'))
      if (data.name) {
        const user: User = {
          id,
          name: data.name,
          ws
        };

        console.log('new user joined', user.name);

        users[id] = user;
        const message: Message = {
          from: 'admin',
          text: `new user connected ${user.name}`,
          timestamp: Date.now()
        }
        messages.push(message);
        sendMessage(message);

        for (const m of messages) {
          sendMessage(m, id);
        }
      }

      if (data.text) {
        const user = users[id];
        const message: Message = {
          from: user.name,
          text: data.text,
          timestamp: Date.now()
        }
        console.log(`new message ${user.name}`, data.text);
        messages.push(message);
        sendMessage(message);
      }
    });

    ws.on('close', () => {
      console.log('user exited', users[id].name);
      delete users[id];
    })

    function sendMessage(message: Message, to: string = 'all') {
      const user = users[id];
      if (to === 'all') {
        Object.values(users).filter(u => u.name !== user.name).forEach(u => {
          u.ws.send(JSON.stringify(message));
        });
      } else {
        users[to].ws.send(JSON.stringify(message));
      }
    }
  });
}


main();
