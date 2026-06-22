const API_BASE_URL = 'http://localhost:8080/api'; // Standard Spring Boot local port

export const authService = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    
    return response.json(); 
  }
};

export const adminService = {
  getUsers: async (token) => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};