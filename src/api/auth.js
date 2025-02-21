import axios from "axios";

const API_URL = "http://localhost:8080/auth/login"; // Update if needed

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(API_URL, { email, password });
        return response.data; // This should contain the JWT token
    } catch (error) {
        console.error("Login failed:", error.response?.data || error.message);
        throw error;
    }
};
