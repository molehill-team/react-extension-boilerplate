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
    body: JSON.stringify({ product: payload }),
    headers,
  });
};

export const login = payload => {
  return fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    body: JSON.stringify({ user: payload }),
    headers: { 'Content-Type': 'application/json' }
  });
};