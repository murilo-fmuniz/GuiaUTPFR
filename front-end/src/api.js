// API utility for authenticated requests

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Debug: log the API base URL
console.log('API_BASE:', API_BASE, 'from env:', import.meta.env.VITE_API_URL);

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
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirou ou é inválido
        localStorage.removeItem('token');
        window.location.href = '/';
      }
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// Chat endpoint - use public endpoint if no auth
export async function sendChatMessage(message) {
  const token = getToken();
  const endpoint = token ? '/chat' : '/chat/public';
  return apiCall(endpoint, 'POST', { message });
}

// Get current user
export async function getCurrentUser() {
  return apiCall('/me', 'GET');
}
