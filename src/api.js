const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const readErrorMessage = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const payload = await res.json();
      return payload?.message || JSON.stringify(payload);
    }
    const text = await res.text();
    if (!text) return 'Erreur serveur';

    try {
      const parsed = JSON.parse(text);
      return parsed?.message || text;
    } catch {
      return text;
    }
  } catch {
    return 'Erreur serveur';
  }
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    return res.json();
  },
  post: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    return res.json();
  },
  postPublic: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    return res.json();
  },
  put: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    return res.json();
  },
  delete: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    return res.json();
  }
};
