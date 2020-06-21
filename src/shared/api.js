import { API_URL } from './resources';

export const createProduct = (payload, token) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  return fetch(`${API_URL}/api/products`, {
    method: 'POST',
    payload: JSON.stringify(payload),
    headers,
  });
};

export const login = payload => {
  return fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    payload: JSON.stringify({ user: payload }),
    headers: { 'Content-Type': 'application/json' }
  });
};