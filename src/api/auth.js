import axios from "axios";

// const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

        // Extract and store token in localStorage
        const { token, user } = response.data; // Get both token and user
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user)); 

        return response.data; // Return user and token
    } catch (error) {
        console.error("Login failed:", error.response?.data || error.message);
        throw error;
    }
};
