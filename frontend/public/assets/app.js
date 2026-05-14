const API_BASE =
  window.__API_BASE__ ||
  ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
    ? 'http://localhost:5000/api'
    : '/api');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

const api = {
  get: (path) => request(path),
  post: (path, body, token) =>
    request(path, {
      method: 'POST',
      body,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
};

const i18n = {
  supported: ['en', 'si', 'ta'],
  state: {
    lang: 'en',
    dict: {}
  },
  getSavedLang() {
    try {
      const value = localStorage.getItem('lang');
      if (value && i18n.supported.includes(value)) return value;
    } catch (e) {}
    return 'en';
  },
  async load(lang) {
    const selected = i18n.supported.includes(lang) ? lang : 'en';
    i18n.state.lang = selected;
    try {
      localStorage.setItem('lang', selected);
    } catch (e) {}

    const res = await fetch(`./i18n/${selected}.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load language file');
    i18n.state.dict = await res.json();
    i18n.apply(document);
  },
  t(key, fallback) {
    const value = i18n.state.dict && i18n.state.dict[key];
    return typeof value === 'string' ? value : (fallback || key);
  },
  apply(root) {
    const nodes = (root || document).querySelectorAll('[data-i18n]');
    nodes.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const text = i18n.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.setAttribute('placeholder', text);
      } else {
        el.textContent = text;
      }
    });
  }
};

function initLanguageToggle(selectId) {
  const el = document.getElementById(selectId);
  if (!el) return;
  const current = i18n.getSavedLang();
  el.value = current;
  el.addEventListener('change', () => {
    i18n.load(el.value).catch(() => {});
  });
  i18n.load(current).catch(() => {});
}

const auth = {
  saveSession: (data) => localStorage.setItem('scp_session', JSON.stringify(data)),
  getSession: () => {
    const raw = localStorage.getItem('scp_session');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      localStorage.removeItem('scp_session');
      return null;
    }
  },
  getToken: () => {
    const session = auth.getSession();
    return session && session.token ? session.token : null;
  },
  getUser: () => {
    const session = auth.getSession();
    return session && session.user ? session.user : null;
  },
  clearSession: () => localStorage.removeItem('scp_session')
};

function getLoginPathForRole(user) {
  return user && user.role === 'admin' ? './admin-login.html' : './login.html';
}

function logoutCurrentUser() {
  const user = auth.getUser();
  auth.clearSession();
  window.location.href = getLoginPathForRole(user);
}

function injectGlobalLogoutButton() {
  if (document.getElementById('logoutBtn')) return;
  const user = auth.getUser();
  const existing = document.getElementById('globalLogoutBtn');
  if (!user) {
    if (existing) existing.remove();
    return;
  }
  if (existing) return;

  const host =
    document.querySelector('.site-header .header-inner') ||
    document.querySelector('header.container.header .row') ||
    document.querySelector('header.container.header') ||
    document.querySelector('header');
  if (!host) return;

  const btn = document.createElement('button');
  btn.id = 'globalLogoutBtn';
  btn.type = 'button';
  btn.className = 'secondary global-logout-btn';
  btn.textContent = 'Logout';
  btn.addEventListener('click', logoutCurrentUser);
  host.appendChild(btn);
}

function syncAuthNavigation() {
  const user = auth.getUser();
  const navs = document.querySelectorAll('nav.nav');

  navs.forEach((nav) => {
    const loginLinks = nav.querySelectorAll('a[href="./login.html"], a[href="login.html"]');
    const registerLinks = nav.querySelectorAll('a[href="./register.html"], a[href="register.html"]');
    const postProjectLinks = nav.querySelectorAll('a[href="./post-project.html"], a[href="post-project.html"]');

    loginLinks.forEach((a) => {
      a.style.display = user ? 'none' : '';
    });
    registerLinks.forEach((a) => {
      a.style.display = user ? 'none' : '';
    });

    postProjectLinks.forEach((a) => {
      if (!user) {
        a.style.display = '';
      } else {
        a.style.display = user.role === 'ngo' ? '' : 'none';
      }
    });

    const existingMyProjects = nav.querySelector('#myPostedProjectsLink');
    if (user && user.role === 'ngo') {
      if (!existingMyProjects) {
        const link = document.createElement('a');
        link.id = 'myPostedProjectsLink';
        link.href = './my-projects.html';
        link.textContent = 'My Posted Projects';
        nav.appendChild(link);
      }
    } else if (existingMyProjects) {
      existingMyProjects.remove();
    }

    let badge = nav.querySelector('#authGreeting');
    if (!user) {
      if (badge) badge.remove();
      return;
    }

    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'authGreeting';
      badge.className = 'muted auth-greeting';
      nav.appendChild(badge);
    }
    badge.textContent = `Hi, ${user.name || user.email}`;
  });
}

const validation = {
  isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase())
};

const ui = {
  clearErrors: (form) => {
    form.querySelectorAll('.error[data-error-for]').forEach((el) => {
      el.textContent = '';
    });
    form.querySelectorAll('.has-error').forEach((el) => {
      el.classList.remove('has-error');
    });
  },
  showErrors: (form, errors) => {
    Object.entries(errors).forEach(([key, message]) => {
      const errEl = form.querySelector(`.error[data-error-for="${key}"]`);
      if (errEl) errEl.textContent = String(message);

      const fieldInput = form.querySelector(`[name="${key}"]`) || form.querySelector(`#${key}`);
      if (fieldInput) {
        const wrapper = fieldInput.closest('.field') || fieldInput.closest('fieldset') || fieldInput;
        if (wrapper && wrapper.classList) wrapper.classList.add('has-error');
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  syncAuthNavigation();
  injectGlobalLogoutButton();
});
