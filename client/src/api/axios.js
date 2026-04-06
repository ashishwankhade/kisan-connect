import axios from 'axios';

// Create an instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust if your backend port is different
  
  // 🔥 CRITICAL: This tells Axios to send the HTTP-Only cookie automatically 
  // with every request to the backend.
  withCredentials: true, 
});

// ❌ We REMOVED the interceptor entirely!
// The browser will now automatically attach the 'token' cookie to the request headers securely.

export default api;