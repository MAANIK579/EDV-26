/* ============================================
   CampusIQ — Application Logic (v2)
   Full Working Interactivity
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ——— DOM References ———
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  const views = document.querySelectorAll('.view');
  const notifBtn = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  const notifClose = document.getElementById('notifClose');
  const chatFab = document.getElementById('chatFab');
  const chatPopup = document.getElementById('chatPopup');
  const chatPopupClose = document.getElementById('chatPopupClose');
  const themeToggle = document.getElementById('themeToggle');
  const todayDate = document.getElementById('todayDate');
  const overlay = document.getElementById('overlay');
  const toastContainer = document.getElementById('toastContainer');
  const liveClock = document.getElementById('liveClock');

  // ——— Utility: Local Storage ———
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('campusiq_' + key); return v !== null ? JSON.parse(v) : fallback; }
      catch { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem('campusiq_' + key, JSON.stringify(val)); } catch { }
    }
  };

  // ===========================================
  // TOAST NOTIFICATION SYSTEM
  // ===========================================
  function showToast(message, type = 'info', duration = 3000) {
    const icons = {
      success: 'fa-check',
      error: 'fa-times',
      info: 'fa-info',
      warning: 'fa-exclamation'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.setProperty('--toast-duration', duration + 'ms');
    toast.style.animationDuration = `0.4s, 0.4s`;
    toast.style.animationDelay = `0s, ${duration - 400}ms`;

    toast.innerHTML = `
      <div class="toast-icon"><i class="fas ${icons[type]}"></i></div>
      <span class="toast-text">${message}</span>
      <span class="toast-close"><i class="fas fa-times"></i></span>
      <div class="toast-progress"></div>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, duration);
  }

  // ===========================================
  // LIVE CLOCK
  // ===========================================
  function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    if (liveClock) liveClock.textContent = `${h12}:${m}:${s} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ——— Set Today's Date ———
  const now = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  if (todayDate) todayDate.textContent = now.toLocaleDateString('en-IN', dateOptions);

  // ——— Dynamic greeting ———
  const greetingEl = document.querySelector('#view-dashboard .view-header h1');
  if (greetingEl) {
    const hour = now.getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 17) greeting = 'Good Afternoon';
    greetingEl.innerHTML = `${greeting}, <span class="accent">Rahul</span> 👋`;
  }

  // ===========================================
  // SPA ROUTER
  // ===========================================
  function navigate(viewName) {
    views.forEach(v => v.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));

    const target = document.getElementById('view-' + viewName);
    if (target) {
      target.classList.add('active');
      target.style.animation = 'none';
      target.offsetHeight;
      target.style.animation = '';
    }

    const navLink = document.querySelector(`.sidebar-nav .nav-link[data-view="${viewName}"]`);
    if (navLink) navLink.classList.add('active');

    // Also update mobile nav
    document.querySelectorAll('.mobile-bottom-nav .nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.view === viewName);
    });

    sidebar.classList.remove('open');
    window.location.hash = viewName;

    // View-specific init
    if (viewName === 'dashboard') initDashboard();
    if (viewName === 'schedule') initSchedule();
    if (viewName === 'academics') {
      setTimeout(() => { animateGradeBars(); animateProgressBars(); }, 100);
    }

    // Scroll to top of main
    document.getElementById('main').scrollTo(0, 0);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(link.dataset.view);
    });
  });

  document.querySelectorAll('[data-navigate]').forEach(card => {
    card.addEventListener('click', () => navigate(card.dataset.navigate));
  });

  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(hash);

  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '') || 'dashboard';
    navigate(h);
  });

  // ===========================================
  // SIDEBAR TOGGLE (Mobile)
  // ===========================================
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 &&
      sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      !menuToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  // ===========================================
  // REAL DARK/LIGHT THEME TOGGLE
  // ===========================================
  const savedTheme = store.get('theme', 'dark');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    document.getElementById('darkModeToggle').checked = false;
  }

  themeToggle.addEventListener('click', () => toggleTheme());

  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', () => toggleTheme());
  }

  function toggleTheme() {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon', !isLight);
    icon.classList.toggle('fa-sun', isLight);
    store.set('theme', isLight ? 'light' : 'dark');

    // Sync profile toggle
    if (darkModeToggle) darkModeToggle.checked = !isLight;

    showToast(isLight ? '☀️ Light mode activated' : '🌙 Dark mode activated', 'info', 2000);
  }

  // ===========================================
  // ANIMATED STAT COUNTERS
  // ===========================================
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    document.querySelectorAll('.stat-value[data-target]').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals) || 0;
      const duration = 1500;
      const start = performance.now();

      function update(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = target * ease;
        el.textContent = current.toFixed(decimals);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  function initDashboard() {
    countersAnimated = false;
    animateCounters();
  }

  if (hash === 'dashboard') initDashboard();

  // ===========================================
  // SCHEDULE TABLE
  // ===========================================
  const scheduleData = {
    '09:00 - 10:00': {
      Mon: { name: 'Data Structures', room: 'Room 301', color: 'var(--cyan)' },
      Tue: { name: 'Machine Learning', room: 'Lab 204', color: 'var(--purple)' },
      Wed: { name: 'Data Structures', room: 'Room 301', color: 'var(--cyan)' },
      Thu: { name: 'Computer Networks', room: 'Room 205', color: 'var(--amber)' },
      Fri: { name: 'Probability & Stats', room: 'Room 102', color: 'var(--green)' }
    },
    '10:00 - 11:00': {
      Mon: { name: 'Operating Systems', room: 'Room 105', color: 'var(--pink)' },
      Tue: null,
      Wed: { name: 'Operating Systems', room: 'Room 105', color: 'var(--pink)' },
      Thu: { name: 'Professional Ethics', room: 'Room 401', color: 'var(--orange)' },
      Fri: { name: 'Machine Learning', room: 'Lab 204', color: 'var(--purple)' }
    },
    '11:00 - 12:00': {
      Mon: { name: 'Machine Learning', room: 'Lab 204', color: 'var(--purple)' },
      Tue: { name: 'Data Structures', room: 'Room 301', color: 'var(--cyan)' },
      Wed: null,
      Thu: { name: 'Machine Learning', room: 'Lab 204', color: 'var(--purple)' },
      Fri: null
    },
    '12:00 - 01:00': {
      Mon: null, Tue: null, Wed: null, Thu: null, Fri: null
    },
    '01:00 - 02:00': {
      Mon: { name: 'Probability & Stats', room: 'Room 102', color: 'var(--green)' },
      Tue: { name: 'Computer Networks', room: 'Room 205', color: 'var(--amber)' },
      Wed: { name: 'Probability & Stats', room: 'Room 102', color: 'var(--green)' },
      Thu: null,
      Fri: { name: 'Operating Systems', room: 'Room 105', color: 'var(--pink)' }
    },
    '02:00 - 03:00': {
      Mon: { name: 'Computer Networks', room: 'Room 205', color: 'var(--amber)' },
      Tue: { name: 'Professional Ethics', room: 'Room 401', color: 'var(--orange)' },
      Wed: { name: 'Computer Networks', room: 'Lab 302', color: 'var(--amber)' },
      Thu: { name: 'Data Structures', room: 'Lab 301', color: 'var(--cyan)' },
      Fri: null
    },
    '03:00 - 04:00': {
      Mon: null,
      Tue: null,
      Wed: { name: 'Professional Ethics', room: 'Room 401', color: 'var(--orange)' },
      Thu: null,
      Fri: { name: 'Computer Networks', room: 'Room 205', color: 'var(--amber)' }
    }
  };

  function initSchedule() {
    const tbody = document.getElementById('scheduleBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const currentHour = now.getHours();

    Object.entries(scheduleData).forEach(([time, slots]) => {
      const tr = document.createElement('tr');
      const hourNum = parseInt(time.split(':')[0]);

      const timeTd = document.createElement('td');
      timeTd.className = 'time-cell';
      timeTd.textContent = time;
      tr.appendChild(timeTd);

      days.forEach(day => {
        const td = document.createElement('td');
        const cls = slots[day];

        if (cls) {
          const isNow = currentHour === hourNum && now.getDay() === days.indexOf(day) + 1;
          td.innerHTML = `
            <div class="class-block ${isNow ? 'now' : ''}" style="--accent: ${cls.color}">
              <span class="class-name">${cls.name}</span>
              <span class="class-room">${cls.room}</span>
              ${isNow ? '<span class="live-badge" style="margin-top:4px">NOW</span>' : ''}
            </div>
          `;
        } else {
          td.innerHTML = '<span style="color:var(--text-dim);font-size:12px">—</span>';
        }
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  // ===========================================
  // CAMPUS MAP INTERACTION
  // ===========================================
  const buildingInfo = {
    'main-block': { name: 'Main Academic Block', floors: 4, departments: 'CSE, ECE, ME, CE', facilities: 'Smart Classrooms, Faculty Cabins, Seminar Halls', hours: '8:00 AM - 6:00 PM', distance: '2 min walk' },
    'library': { name: 'Central Library', floors: 3, departments: 'All Departments', facilities: '50,000+ Books, Digital Section, Reading Halls, Discussion Rooms', hours: '8:00 AM - 11:00 PM', distance: '3 min walk' },
    'cs-block': { name: 'CS & IT Block', floors: 3, departments: 'CSE, IT, AI/ML', facilities: 'Computer Labs, Project Rooms, IoT Lab, AI Research Lab', hours: '8:00 AM - 8:00 PM', distance: '5 min walk' },
    'admin': { name: 'Admin Building', floors: 2, departments: 'Administration', facilities: 'Registrar, Dean Office, Accounts, Admissions', hours: '9:00 AM - 5:00 PM', distance: '6 min walk' },
    'labs': { name: 'Science Labs', floors: 2, departments: 'Physics, Chemistry, Biology', facilities: 'Research Labs, Equipment Room, Clean Room', hours: '9:00 AM - 5:00 PM', distance: '3 min walk' },
    'cafeteria': { name: 'Food Court & Cafeteria', floors: 1, departments: 'All Students', facilities: 'Multi-cuisine, Juice Bar, Snack Corner', hours: '7:00 AM - 10:00 PM', distance: '4 min walk' },
    'sports': { name: 'Sports Complex', floors: 2, departments: 'Sports Department', facilities: 'Indoor & Outdoor Courts, Gym, Swimming Pool, Track', hours: '6:00 AM - 9:00 PM', distance: '7 min walk' },
    'auditorium': { name: 'Auditorium', floors: 1, departments: 'Events & Cultural', facilities: '1000 Seats, Sound System, Stage, Green Room', hours: 'Event-based', distance: '5 min walk' },
    'hostel': { name: 'Hostel Block A & B', floors: 5, departments: 'Residential', facilities: 'Rooms, Common Room, Laundry, Wi-Fi', hours: '24/7', distance: '8 min walk' },
    'health': { name: 'Health Center', floors: 1, departments: 'Medical', facilities: 'OPD, Pharmacy, Emergency, Counseling', hours: '24/7 Emergency', distance: '9 min walk' }
  };

  document.querySelectorAll('.map-building').forEach(building => {
    building.addEventListener('click', () => {
      const id = building.dataset.building;
      const info = buildingInfo[id];
      if (!info) return;

      document.querySelectorAll('.map-building').forEach(b => b.classList.remove('selected'));
      building.classList.add('selected');

      const mapInfoEl = document.getElementById('mapInfo');
      mapInfoEl.innerHTML = `
        <div class="map-info-detail">
          <h3>${info.name}</h3>
          <div class="info-row"><i class="fas fa-layer-group"></i> ${info.floors} Floors</div>
          <div class="info-row"><i class="fas fa-building"></i> ${info.departments}</div>
          <div class="info-row"><i class="fas fa-tools"></i> ${info.facilities}</div>
          <div class="info-row"><i class="fas fa-clock"></i> ${info.hours}</div>
          <div class="info-row"><i class="fas fa-walking"></i> ${info.distance} from you</div>
          <button class="btn btn-primary btn-sm" style="margin-top:16px;width:100%" onclick="document.dispatchEvent(new CustomEvent('getDirections', {detail:'${info.name}'}))">
            <i class="fas fa-directions"></i> Get Directions
          </button>
        </div>
      `;
    });
  });

  document.addEventListener('getDirections', (e) => {
    showToast(`🗺️ Showing directions to ${e.detail}...`, 'info', 2500);
  });

  const mapSearch = document.getElementById('mapSearch');
  if (mapSearch) {
    mapSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('.map-building').forEach(b => {
        const name = b.dataset.name.toLowerCase();
        if (query && name.includes(query)) {
          b.classList.add('selected');
        } else {
          b.classList.remove('selected');
        }
      });
    });
  }

  // ===========================================
  // EVENT FILTERS + RSVP WITH CONFETTI & STORAGE
  // ===========================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const eventCards = document.querySelectorAll('.event-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      eventCards.forEach((card, i) => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;
        card.style.display = show ? 'block' : 'none';
        if (show) {
          card.style.animation = 'none';
          card.offsetHeight;
          card.style.animation = `slideUp 0.4s var(--ease) ${i * 0.05}s both`;
        }
      });

      showToast(`Showing ${filter === 'all' ? 'all' : filter} events`, 'info', 1500);
    });
  });

  // RSVP with confetti + localStorage
  const rsvpState = store.get('rsvps', {});

  document.querySelectorAll('.event-card').forEach((card, idx) => {
    const btn = card.querySelector('.btn-primary');
    const eventName = card.querySelector('h3').textContent;

    // Restore RSVP state
    if (rsvpState[eventName]) {
      btn.classList.add('rsvpd');
      btn.innerHTML = '<i class="fas fa-check"></i> RSVP\'d!';
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (btn.classList.contains('rsvpd')) {
        btn.classList.remove('rsvpd');
        btn.innerHTML = 'RSVP Now';
        delete rsvpState[eventName];
        store.set('rsvps', rsvpState);
        showToast(`❌ RSVP cancelled for "${eventName}"`, 'warning', 2500);
      } else {
        btn.classList.add('rsvpd');
        btn.innerHTML = '<i class="fas fa-check"></i> RSVP\'d!';
        rsvpState[eventName] = true;
        store.set('rsvps', rsvpState);
        showToast(`🎉 RSVP confirmed for "${eventName}"`, 'success', 3000);
        spawnConfetti(e);
      }
    });
  });

  function spawnConfetti(e) {
    const colors = ['#00d4ff', '#7c3aed', '#f472b6', '#fbbf24', '#34d399', '#f97316'];
    const rect = e.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    for (let i = 0; i < 20; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = (x + (Math.random() - 0.5) * 100) + 'px';
      piece.style.top = (y - 10) + 'px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (1 + Math.random()) + 's';
      piece.style.animationDelay = (Math.random() * 0.3) + 's';
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2000);
    }
  }

  // ===========================================
  // NOTIFICATION PANEL + MANAGEMENT
  // ===========================================
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifPanel.classList.toggle('open');
  });

  notifClose.addEventListener('click', () => {
    notifPanel.classList.remove('open');
  });

  document.addEventListener('click', (e) => {
    if (notifPanel.classList.contains('open') &&
      !notifPanel.contains(e.target) &&
      !notifBtn.contains(e.target)) {
      notifPanel.classList.remove('open');
    }
  });

  // Mark notification as read on click
  document.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.remove('unread');
      updateNotifBadge();
    });
  });

  function updateNotifBadge() {
    const unread = document.querySelectorAll('.notif-item.unread').length;
    const badge = notifBtn.querySelector('.badge');
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'grid' : 'none';
    }
  }

  // ===========================================
  // FLOATING CHAT WIDGET
  // ===========================================
  chatFab.addEventListener('click', () => {
    chatPopup.classList.toggle('open');
  });

  chatPopupClose.addEventListener('click', () => {
    chatPopup.classList.remove('open');
  });

  const chatPopupForm = document.getElementById('chatPopupForm');
  const chatPopupInput = document.getElementById('chatPopupInput');
  const chatPopupMessages = document.getElementById('chatPopupMessages');

  chatPopupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = chatPopupInput.value.trim();
    if (!msg) return;
    appendMessage(chatPopupMessages, msg, 'user');
    chatPopupInput.value = '';
    showTypingThenRespond(chatPopupMessages, msg);
  });

  // ===========================================
  // FULL-SCREEN CHAT
  // ===========================================
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;

    appendMessage(chatMessages, msg, 'user');
    chatInput.value = '';

    const suggestions = document.getElementById('chatSuggestions');
    if (suggestions) suggestions.style.display = 'none';

    showTypingThenRespond(chatMessages, msg);
  });

  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.q;
      chatInput.value = q;
      chatForm.dispatchEvent(new Event('submit'));
    });
  });

  // ===========================================
  // CHAT HELPERS
  // ===========================================
  function appendMessage(container, text, sender) {
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;

    if (sender === 'user') {
      div.innerHTML = `
        <div class="chat-avatar"><i class="fas fa-user"></i></div>
        <div class="chat-bubble"><p>${escapeHTML(text)}</p></div>
      `;
    } else {
      div.innerHTML = `
        <div class="chat-avatar"><i class="fas fa-robot"></i></div>
        <div class="chat-bubble"><p>${text}</p></div>
      `;
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showTypingThenRespond(container, userMsg) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-msg bot';
    typingDiv.innerHTML = `
      <div class="chat-avatar"><i class="fas fa-robot"></i></div>
      <div class="chat-bubble typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
      container.removeChild(typingDiv);
      const response = generateResponse(userMsg);
      appendMessage(container, response, 'bot');
    }, 1200 + Math.random() * 800);
  }

  function generateResponse(msg) {
    const lower = msg.toLowerCase();

    // Time-aware responses
    const currentTime = new Date();
    const curHour = currentTime.getHours();
    const curMin = currentTime.getMinutes();

    if (lower.includes('time') || lower.includes('what time')) {
      const h = curHour % 12 || 12;
      const ampm = curHour >= 12 ? 'PM' : 'AM';
      return `🕐 The current time is <strong>${h}:${curMin.toString().padStart(2, '0')} ${ampm}</strong>. Is there anything else you need?`;
    }
    if (lower.includes('next class') || lower.includes('schedule') || lower.includes('class')) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = dayNames[currentTime.getDay()];
      let nextClass = null;

      if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(today)) {
        for (const [time, slots] of Object.entries(scheduleData)) {
          const hourNum = parseInt(time.split(':')[0]);
          const adjustedHour = hourNum < 8 ? hourNum + 12 : hourNum;
          if (adjustedHour > curHour && slots[today]) {
            nextClass = { ...slots[today], time };
            break;
          }
        }
      }

      if (nextClass) {
        return `📅 Your next class is <strong>${nextClass.name}</strong> at <strong>${nextClass.time.split(' - ')[0]}</strong> in <strong>${nextClass.room}</strong>. Don't be late! 🏃`;
      }
      return `📅 You have no more classes scheduled for today. Enjoy your free time! Here's your <a href="#schedule" onclick="location.hash='schedule'" style="color:var(--cyan)">full weekly schedule</a>.`;
    }
    if (lower.includes('cafeteria') || lower.includes('menu') || lower.includes('food') || lower.includes('lunch')) {
      return `🍽️ Today's menu:<br>• <strong>Breakfast:</strong> Aloo Paratha, Curd, Tea/Coffee<br>• <strong>Lunch:</strong> Rajma Chawal, Roti, Mixed Salad<br>• <strong>Dinner:</strong> Paneer Butter Masala, Naan, Gulab Jamun<br>• <strong>Snacks:</strong> Samosa, Vada Pav, Cold Coffee<br><br>Cafeteria is open until 10 PM!`;
    }
    if (lower.includes('library')) {
      return `📚 The <strong>Central Library</strong> is about 3 min walk from you. Hours: <strong>8:00 AM - 11:00 PM</strong> (exam season). 50,000+ books, digital section, and discussion rooms available.<br><br>Click <a href="#map" onclick="location.hash='map'" style="color:var(--cyan)">Campus Map</a> to see directions.`;
    }
    if (lower.includes('event') || lower.includes('hackathon')) {
      return `🎉 Upcoming events:<br>• <strong>Sports Day</strong> — Feb 28<br>• <strong>AI/ML Lecture</strong> — Mar 3<br>• <strong>Cloud Workshop</strong> — Mar 5<br>• <strong>Cultural Fest</strong> — Mar 8<br>• <strong>Hackathon</strong> — Mar 15-16 (₹50K!)<br><br>Go to <a href="#events" onclick="location.hash='events'" style="color:var(--cyan)">Events</a> to RSVP!`;
    }
    if (lower.includes('attendance')) {
      return `📊 Attendance breakdown:<br>• Data Structures: 90% ✅<br>• Machine Learning: 88% ✅<br>• Operating Systems: 82% ⚠️<br>• Computer Networks: 92% ✅<br>• Prob & Stats: 85% ✅<br>• Professional Ethics: 95% ✅<br><br>Overall: <strong>87%</strong>. Watch out for OS! 🎯`;
    }
    if (lower.includes('gpa') || lower.includes('grade') || lower.includes('marks')) {
      return `🎓 CGPA: <strong>8.9</strong><br>• ML: A+ (92%) | Ethics: A+ (95%)<br>• Prob & Stats: A+ (91%) | DSA: A (88%)<br>• Networks: A (85%) | OS: B+ (79%)<br><br>Check <a href="#academics" onclick="location.hash='academics'" style="color:var(--cyan)">Academics</a> for details. Focus on OS! 💪`;
    }
    if (lower.includes('bus') || lower.includes('transport')) {
      return `🚌 Next buses:<br>• <strong>2:30 PM</strong> → City Center<br>• <strong>3:15 PM</strong> → Railway Station<br>• <strong>4:00 PM</strong> → City Center<br>• <strong>5:30 PM</strong> → Mall Road<br><br>Bus stop: Main Gate (4 min walk)`;
    }
    if (lower.includes('exam') || lower.includes('mid-sem') || lower.includes('midterm')) {
      return `📝 <strong>Mid-Sems</strong> start <strong>March 10</strong>:<br>• Mar 10: DSA<br>• Mar 12: ML<br>• Mar 14: OS<br>• Mar 17: CN<br>• Mar 19: Prob & Stats<br><br>Library extended hours till 11 PM! 📖`;
    }
    if (lower.includes('weather')) {
      return `🌤️ Today's weather: <strong>28°C</strong>, partly cloudy. Good day for outdoor activities! The Sports Complex is open until 9 PM.`;
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return `Hey Rahul! 👋 What can I help you with? Try asking about your schedule, grades, events, cafeteria menu, or anything campus-related! 🎓`;
    }
    if (lower.includes('thank')) {
      return `You're welcome! 😊 Always here to help. Have a great day on campus! 🎓`;
    }
    if (lower.includes('help')) {
      return `Here's what I can help with:<br>• 📅 <strong>Schedule</strong> — "What's my next class?"<br>• 📊 <strong>Grades</strong> — "What's my GPA?"<br>• 🎉 <strong>Events</strong> — "Any upcoming events?"<br>• 🍽️ <strong>Food</strong> — "Cafeteria menu"<br>• 🗺️ <strong>Navigation</strong> — "Where is the library?"<br>• 🚌 <strong>Transport</strong> — "Bus schedule"<br>• 📝 <strong>Exams</strong> — "Exam timetable"<br>• 🕐 <strong>Time</strong> — "What time is it?"`;
    }

    return `I'd be happy to help! Here are some things you can ask:<br>• 📅 "What's my next class?"<br>• 📊 "What's my attendance?"<br>• 🎉 "Any upcoming events?"<br>• 🍽️ "Cafeteria menu"<br>• 🗺️ "Where is the library?"<br>• 🕐 "What time is it?"<br><br>Or type <strong>/help</strong> for a full list!`;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ===========================================
  // SEARCH DROPDOWN
  // ===========================================
  const globalSearch = document.getElementById('globalSearch');
  const searchDropdown = document.getElementById('searchDropdown');

  const searchIndex = [
    { title: 'Dashboard', sub: 'Home overview', icon: 'fa-th-large', view: 'dashboard', category: 'Navigation' },
    { title: 'Weekly Schedule', sub: 'Class timetable', icon: 'fa-calendar-alt', view: 'schedule', category: 'Navigation' },
    { title: 'Campus Map', sub: 'Building navigation', icon: 'fa-map-marked-alt', view: 'map', category: 'Navigation' },
    { title: 'Events', sub: 'Campus events & RSVP', icon: 'fa-calendar-day', view: 'events', category: 'Navigation' },
    { title: 'Academics', sub: 'Courses & grades', icon: 'fa-book-open', view: 'academics', category: 'Navigation' },
    { title: 'Services', sub: 'Campus facilities', icon: 'fa-concierge-bell', view: 'services', category: 'Navigation' },
    { title: 'AI Chat', sub: 'Ask CampusIQ anything', icon: 'fa-robot', view: 'chat', category: 'Navigation' },
    { title: 'Profile & Settings', sub: 'Account preferences', icon: 'fa-user-circle', view: 'profile', category: 'Navigation' },
    { title: 'Data Structures & Algorithms', sub: 'CS301 · Prof. Mehra', icon: 'fa-code', view: 'academics', category: 'Courses' },
    { title: 'Machine Learning', sub: 'CS405 · Dr. Kapoor', icon: 'fa-brain', view: 'academics', category: 'Courses' },
    { title: 'Operating Systems', sub: 'CS310 · Prof. Singh', icon: 'fa-server', view: 'academics', category: 'Courses' },
    { title: 'Computer Networks', sub: 'CS420 · Dr. Das', icon: 'fa-network-wired', view: 'academics', category: 'Courses' },
    { title: 'Probability & Statistics', sub: 'MA201 · Prof. Roy', icon: 'fa-chart-bar', view: 'academics', category: 'Courses' },
    { title: 'Professional Ethics', sub: 'HS102 · Dr. Jain', icon: 'fa-balance-scale', view: 'academics', category: 'Courses' },
    { title: 'Central Library', sub: 'Open until 11 PM', icon: 'fa-book', view: 'map', category: 'Buildings' },
    { title: 'CS & IT Block', sub: 'Computer labs & research', icon: 'fa-laptop-code', view: 'map', category: 'Buildings' },
    { title: 'Cafeteria', sub: 'Food court & dining', icon: 'fa-utensils', view: 'services', category: 'Buildings' },
    { title: 'Sports Complex', sub: 'Gym, courts, pool', icon: 'fa-dumbbell', view: 'map', category: 'Buildings' },
    { title: 'Health Center', sub: '24/7 Emergency', icon: 'fa-heartbeat', view: 'map', category: 'Buildings' },
    { title: 'Auditorium', sub: 'Events & cultural', icon: 'fa-theater-masks', view: 'map', category: 'Buildings' },
    { title: 'Campus Hackathon 2026', sub: 'Mar 15-16 · Auditorium', icon: 'fa-trophy', view: 'events', category: 'Events' },
    { title: 'Cultural Fest SPANDAN', sub: 'Mar 8 · Main Ground', icon: 'fa-music', view: 'events', category: 'Events' },
    { title: 'Annual Sports Day', sub: 'Feb 28 · Sports Complex', icon: 'fa-running', view: 'events', category: 'Events' },
    { title: 'AI/ML Guest Lecture', sub: 'Mar 3 · Room 301', icon: 'fa-chalkboard-teacher', view: 'events', category: 'Events' },
  ];

  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query.length < 1) {
        searchDropdown.classList.remove('open');
        return;
      }

      const results = searchIndex.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.sub.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );

      if (results.length === 0) {
        searchDropdown.innerHTML = '<div class="no-results"><i class="fas fa-search"></i> No results found</div>';
      } else {
        // Group by category
        const grouped = {};
        results.forEach(r => {
          if (!grouped[r.category]) grouped[r.category] = [];
          grouped[r.category].push(r);
        });

        let html = '';
        for (const [cat, items] of Object.entries(grouped)) {
          html += `<div class="search-category">${cat}</div>`;
          items.forEach(item => {
            html += `
              <div class="search-result" data-view="${item.view}">
                <i class="fas ${item.icon}"></i>
                <div>
                  <div class="sr-title">${highlightMatch(item.title, query)}</div>
                  <div class="sr-sub">${item.sub}</div>
                </div>
              </div>
            `;
          });
        }
        searchDropdown.innerHTML = html;

        // Add click handlers
        searchDropdown.querySelectorAll('.search-result').forEach(result => {
          result.addEventListener('click', () => {
            navigate(result.dataset.view);
            searchDropdown.classList.remove('open');
            globalSearch.value = '';
            globalSearch.blur();
          });
        });
      }

      searchDropdown.classList.add('open');
    });

    globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = globalSearch.value.trim().toLowerCase();
        if (!query) return;

        // Find first result and navigate
        const firstResult = searchDropdown.querySelector('.search-result');
        if (firstResult) {
          navigate(firstResult.dataset.view);
        } else {
          navigate('chat');
          chatInput.value = query;
          chatForm.dispatchEvent(new Event('submit'));
        }

        searchDropdown.classList.remove('open');
        globalSearch.value = '';
        globalSearch.blur();
      }
      if (e.key === 'Escape') {
        searchDropdown.classList.remove('open');
        globalSearch.blur();
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const container = document.getElementById('searchContainer');
      if (container && !container.contains(e.target)) {
        searchDropdown.classList.remove('open');
      }
    });
  }

  function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return text;
    return text.slice(0, idx) + '<strong style="color:var(--cyan)">' + text.slice(idx, idx + query.length) + '</strong>' + text.slice(idx + query.length);
  }

  // ===========================================
  // ASSIGNMENT COMPLETION TOGGLE
  // ===========================================
  const completedAssignments = store.get('completedAssignments', {});

  document.querySelectorAll('.assign-item').forEach(item => {
    const label = item.querySelector('span:first-child');
    if (!label) return;
    const key = label.textContent.trim();

    // Add checkbox
    const check = document.createElement('div');
    check.className = 'assign-check';
    check.innerHTML = '<i class="fas fa-check"></i>';
    item.prepend(check);

    // Restore state
    if (completedAssignments[key]) {
      item.classList.add('completed');
    }

    item.addEventListener('click', () => {
      item.classList.toggle('completed');
      const isComplete = item.classList.contains('completed');
      if (isComplete) {
        completedAssignments[key] = true;
        showToast(`✅ "${key.replace(/^.*?:\s*/, '')}" marked as done!`, 'success', 2500);
      } else {
        delete completedAssignments[key];
        showToast(`↩️ "${key.replace(/^.*?:\s*/, '')}" unmarked`, 'info', 2000);
      }
      store.set('completedAssignments', completedAssignments);
    });
  });

  // ===========================================
  // SETTINGS TOGGLES WITH PERSISTENCE & TOASTS
  // ===========================================
  const notifToggle = document.getElementById('notifToggle');
  const emailToggle = document.getElementById('emailToggle');
  const langSelect = document.getElementById('langSelect');

  // Restore settings
  if (notifToggle) {
    notifToggle.checked = store.get('pushNotifs', true);
    notifToggle.addEventListener('change', () => {
      store.set('pushNotifs', notifToggle.checked);
      showToast(notifToggle.checked ? '🔔 Push notifications enabled' : '🔕 Push notifications disabled', 'info', 2000);
    });
  }

  if (emailToggle) {
    emailToggle.checked = store.get('emailDigests', false);
    emailToggle.addEventListener('change', () => {
      store.set('emailDigests', emailToggle.checked);
      showToast(emailToggle.checked ? '📧 Weekly email digests enabled' : '📧 Email digests disabled', 'info', 2000);
    });
  }

  if (langSelect) {
    langSelect.value = store.get('language', 'en');
    langSelect.addEventListener('change', () => {
      store.set('language', langSelect.value);
      const langNames = { en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu' };
      showToast(`🌐 Language set to ${langNames[langSelect.value]}`, 'success', 2000);
    });
  }

  // ===========================================
  // SERVICE TILES — INTERACTIVE
  // ===========================================
  document.querySelectorAll('.service-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const name = tile.querySelector('h3').textContent;
      const status = tile.querySelector('.service-status').textContent;
      showToast(`🏫 ${name}: ${status}`, 'info', 2500);
    });
  });

  // ===========================================
  // MOBILE BOTTOM NAV
  // ===========================================
  function createMobileNav() {
    if (window.innerWidth <= 768 && !document.querySelector('.mobile-bottom-nav')) {
      const mobileNav = document.createElement('nav');
      mobileNav.className = 'mobile-bottom-nav';

      const mobileLinks = [
        { view: 'dashboard', icon: 'fa-th-large', label: 'Home' },
        { view: 'schedule', icon: 'fa-calendar-alt', label: 'Schedule' },
        { view: 'events', icon: 'fa-calendar-day', label: 'Events' },
        { view: 'academics', icon: 'fa-book-open', label: 'Grades' },
        { view: 'chat', icon: 'fa-robot', label: 'AI Chat' }
      ];

      mobileLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = `#${link.view}`;
        a.className = `nav-link${link.view === hash ? ' active' : ''}`;
        a.dataset.view = link.view;
        a.innerHTML = `<i class="fas ${link.icon}"></i><span>${link.label}</span>`;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          navigate(link.view);
        });
        mobileNav.appendChild(a);
      });

      document.body.appendChild(mobileNav);
    } else if (window.innerWidth > 768) {
      const existing = document.querySelector('.mobile-bottom-nav');
      if (existing) existing.remove();
    }
  }

  createMobileNav();
  window.addEventListener('resize', createMobileNav);

  // ===========================================
  // GRADE BAR + PROGRESS BAR ANIMATIONS
  // ===========================================
  function animateGradeBars() {
    document.querySelectorAll('.grade-fill').forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => { bar.style.width = width; }, 200);
    });
  }

  function animateProgressBars() {
    document.querySelectorAll('.progress-fill').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => { bar.style.width = w; }, 300);
    });
  }

  // ===========================================
  // KEYBOARD SHORTCUTS
  // ===========================================
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
      e.preventDefault();
      globalSearch.focus();
    }
    if (e.key === 'Escape') {
      notifPanel.classList.remove('open');
      chatPopup.classList.remove('open');
      sidebar.classList.remove('open');
      searchDropdown.classList.remove('open');
    }
  });

  // ===========================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ===========================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.stat-card, .event-card, .course-card, .service-tile').forEach(el => {
    observer.observe(el);
  });

  // ===========================================
  // WELCOME TOAST
  // ===========================================
  setTimeout(() => {
    showToast('👋 Welcome back, Rahul! You have 3 new notifications.', 'info', 4000);
  }, 1500);

  console.log('%c🎓 CampusIQ', 'font-size:24px;font-weight:bold;color:#00d4ff;');
  console.log('%cAI-Powered Smart Campus Assistant v2', 'font-size:14px;color:#94a3b8;');

});
