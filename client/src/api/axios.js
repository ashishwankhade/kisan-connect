const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ✅ Use env var, not hardcoded localhost
  withCredentials: true,
});

export default api;