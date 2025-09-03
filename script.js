const ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
const messagesDiv = document.getElementById('messages');
const input = document.getElementById('messageInput');

ws.onmessage = (event) => {
  const msg = document.createElement('div');
  msg.textContent = event.data;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

function sendMessage() {
  if (input.value.trim() !== '') {
    ws.send(input.value);
    input.value = '';
  }
}
