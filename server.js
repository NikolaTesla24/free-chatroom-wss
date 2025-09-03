const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;

const server = new WebSocket.Server({ port: PORT });

server.on('connection', socket => {
  console.log('کلاینت وصل شد');
  socket.send('اتصال برقرار شد!');

  socket.on('message', msg => {
    console.log('پیام دریافت شد:', msg);
    socket.send(`پاسخ: ${msg}`);
  });
});

console.log(`WebSocket Server در حال اجرا روی پورت ${PORT}`);
