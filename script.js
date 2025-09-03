// script.js
(() => {
  const joinCard = document.getElementById('joinCard');
  const chatCard = document.getElementById('chatCard');
  const joinForm = document.getElementById('joinForm');
  const nameInput = document.getElementById('nameInput');
  const roomInput = document.getElementById('roomInput');
  const aboutInput = document.getElementById('aboutInput');
  const wsInput = document.getElementById('wsInput');

  const roomTitle = document.getElementById('roomTitle');
  const youPill = document.getElementById('youPill');
  const usersList = document.getElementById('usersList');
  const msgs = document.getElementById('msgs');
  const msgForm = document.getElementById('msgForm');
  const msgInput = document.getElementById('msgInput');
  const leaveBtn = document.getElementById('leaveBtn');
  const editAboutBtn = document.getElementById('editAboutBtn');
  const aboutDialog = document.getElementById('aboutDialog');
  const aboutEdit = document.getElementById('aboutEdit');
  const saveAboutBtn = document.getElementById('saveAboutBtn');

  let ws = null;
  let my = {
    name: localStorage.getItem('name') || '',
    about: localStorage.getItem('about') || '',
    room: '',
    server: localStorage.getItem('server') || 'ws://localhost:8080'
  };

  // Prefill form
  nameInput.value = my.name;
  aboutInput.value = my.about;
  wsInput.value = my.server;

  function connect() {
    ws = new WebSocket(my.server);

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({
        type: 'join',
        room: my.room,
        name: my.name,
        about: my.about
      }));
    });

    ws.addEventListener('message', (ev) => {
      let data;
      try { data = JSON.parse(ev.data); } catch { return; }

      if (data.type === 'system') {
        renderSystem(data.text);
      }

      if (data.type === 'users') {
        renderUsers(data.users);
      }

      if (data.type === 'chat') {
        renderMsg(data);
      }
    });

    ws.addEventListener('close', () => {
      renderSystem('ارتباط قطع شد. دوباره تلاش کنید یا سرور رو بررسی کنید.');
    });
  }

  function renderSystem(text) {
    const li = document.createElement('li');
    li.className = 'msg system';
    li.textContent = text;
    msgs.appendChild(li);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function renderUsers(users) {
    usersList.innerHTML = '';
    users.forEach(u => {
      const li = document.createElement('li');
      li.className = 'user';
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = u.name || 'ناشناس';

      const about = document.createElement('div');
      about.className = 'about';
      about.textContent = u.about || '';

      li.appendChild(name);
      if (u.about) li.appendChild(about);
      usersList.appendChild(li);
    });
  }

  function renderMsg({ from, text, ts, about }) {
    const li = document.createElement('li');
    li.className = 'msg' + (from === my.name ? ' self' : '');
    const meta = document.createElement('div');
    meta.className = 'meta';
    const time = new Date(ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    meta.textContent = `${from} • ${time}`;
    const body = document.createElement('div');
    body.className = 'body';
    body.textContent = text;
    li.appendChild(meta);
    li.appendChild(body);

    // Tooltip-like about (title attribute)
    if (about) li.title = `About: ${about}`;

    msgs.appendChild(li);
    msgs.scrollTop = msgs.scrollHeight;
  }

  joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    my.name = nameInput.value.trim() || 'کاربر';
    my.room = roomInput.value.trim() || 'public';
    my.about = aboutInput.value.trim();
    my.server = (wsInput.value.trim() || 'ws://localhost:8080');

    localStorage.setItem('name', my.name);
    localStorage.setItem('about', my.about);
    localStorage.setItem('server', my.server);

    roomTitle.textContent = `اتاق ${my.room}`;
    youPill.textContent = `تو: ${my.name}`;
    joinCard.classList.add('hidden');
    chatCard.classList.remove('hidden');

    connect();
  });

  msgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = msgInput.value.trim();
    if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'chat', room: my.room, text }));
    msgInput.value = '';
  });

  leaveBtn.addEventListener('click', () => {
    if (ws) {
      ws.close();
      ws = null;
    }
    chatCard.classList.add('hidden');
    joinCard.classList.remove('hidden');
  });

  editAboutBtn.addEventListener('click', () => {
    aboutEdit.value = my.about;
    aboutDialog.showModal();
  });

  saveAboutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const newAbout = aboutEdit.value.trim();
    my.about = newAbout;
    localStorage.setItem('about', my.about);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'update-about', about: my.about }));
    }
    aboutDialog.close();
  });
})();