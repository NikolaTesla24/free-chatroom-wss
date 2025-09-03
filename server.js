import { WebSocketServer } from 'ws';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- سرور HTTP امن برای همه فایل‌ها ----------
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // اگر مسیر به پوشه باشد، index.html را پیدا کن
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html':'text/html',
    '.js':'text/javascript',
    '.css':'text/css',
    '.png':'image/png',
    '.jpg':'image/jpeg',
    '.jpeg':'image/jpeg',
    '.webm':'video/webm',
    '.mp3':'audio/mpeg'
  };

  fs.readFile(filePath, (err, content) => {
    if(err){
      res.writeHead(404, {'Content-Type':'text/plain'});
      res.end('404 Not Found');
    } else {
      res.writeHead(200, {'Content-Type': mimeTypes[ext] || 'text/plain'});
      res.end(content, 'utf-8');
    }
  });
});

server.listen(3000, () => console.log('🚀 سرور HTTP روی پورت 3000 اجرا شد'));

// ---------- WebSocket ----------
const wss = new WebSocketServer({ server });
let users = [];

wss.on('connection', (ws) => {
  let currentUser = null;

  ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString());

    if(data.type === 'join'){
      currentUser = { name: data.name, avatar: data.avatar, ws };
      users.push(currentUser);
      broadcast({ type:'system', text:`${data.name} وارد شد!` });
      broadcastUsers();
    }

    if(data.type === 'chat' && currentUser){
      broadcast({ type:'chat', user: currentUser, text: data.text });
    }

    if(data.type === 'voice' && currentUser){
      broadcast({ type:'voice', user: currentUser, blob: data.blob });
    }
  });

  ws.on('close', () => {
    if(currentUser){
      users = users.filter(u => u !== currentUser);
      broadcast({ type:'system', text:`${currentUser.name} از چت خارج شد.` });
      broadcastUsers();
    }
  });
});

// ---------- توابع کمکی ----------
function broadcast(data){
  users.forEach(u => {
    if(u.ws.readyState === 1){
      u.ws.send(JSON.stringify(data));
    }
  });
}

function broadcastUsers(){
  const userList = users.map(u => ({ name:u.name, avatar:u.avatar }));
  broadcast({ type:'users', users: userList });
}
