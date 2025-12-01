// API utility for authenticated requests

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Get token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Set token in localStorage
export function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

// Make authenticated API request
export async function apiCall(endpoint, method = 'GET', body = null) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
  };
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expirou ou é inválido
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || 'API Error');
  }
  
  return response.json();
}

// Chat endpoint
export async function sendChatMessage(message) {
  return apiCall('/chat', 'POST', { message });
}

// Get current user
export async function getCurrentUser() {
  return apiCall('/me', 'GET');
}
