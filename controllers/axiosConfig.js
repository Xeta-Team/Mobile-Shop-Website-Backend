import axios from 'axios';

// Create a new instance of axios
const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`, // Your backend API base URL
});

// Use an interceptor to automatically add the token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Configure the header to send the token
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }
);

export default apiClient;
