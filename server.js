const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const app = express();

// ارائه فایل‌های استاتیک
app.use(express.static(path.join(__dirname, 'public')));

// راه‌اندازی سرور HTTP
const server = app.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});

// راه‌اندازی WebSocket روی همان سرور
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('کلاینت وصل شد');

  ws.on('message', msg => {
    console.log('پیام دریافت شد:', msg);
    // ارسال پیام به همه کلاینت‌ها
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });

  ws.send('اتصال برقرار شد!');
});
