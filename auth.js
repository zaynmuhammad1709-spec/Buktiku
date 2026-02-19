const SUPABASE_URL = 'https://xrvvwyrvjwloxxvcurev.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydnZ3eXJ2andsb3h4dmN1cmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzEwMTksImV4cCI6MjA4NzA0NzAxOX0.ZgC-oi8RaqKK4tkzPpECO_fOUUMUqFpl0p6oxkXMJK8';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function showMessage(elementId, text, isError = false) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = text;
    el.className = isError ? 'error' : 'success';
  }
}

// Fungsi register (dipanggil dari register.html)
async function register(event) {
  event.preventDefault();
  showMessage('message', 'Memproses...', false);

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (password.length < 6) {
    showMessage('message', 'Password minimal 6 karakter', true);
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    showMessage('message', 'Email tidak valid (contoh: nama@domain.com)', true);
    return;
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    showMessage('message', error.message || 'Gagal daftar', true);
  } else {
    showMessage('message', 'Berhasil daftar! Silakan login.', false);
  }
}

// Fungsi login (dipanggil dari login.html)
async function login(event) {
  event.preventDefault();
  showMessage('message', 'Memproses login...', false);

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage('message', error.message || 'Login gagal', true);
  } else {
    showMessage('message', 'Login berhasil! Mengarahkan...', false);
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
  }
}

// Fungsi cek session & logout (dipakai di dashboard.html)
async function initDashboard() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
  } else {
    const userEl = document.getElementById('user-info');
    if (userEl) userEl.textContent = `Logged in as: ${session.user.email}`;
  }
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
}