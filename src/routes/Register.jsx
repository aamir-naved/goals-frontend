import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import axios from "axios";
// const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import "./Register.css";

const Register = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        console.log(API_BASE_URL)
        const token = localStorage.getItem("token");
        if (token) {
            console.log("User is already logged in...Redirecting to Dashboard.")
            navigate("/dashboard"); // Redirect if already logged in
        }
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true); // Start loading
        try {
            // Register the user
            const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
                email, name, password
            });
            console.log(registerResponse.data);

            // If registration is successful, log in immediately
            const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
                email, password
            });

            const { token, user } = loginResponse.data; // Get both token and user
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user)); // Store user object

            navigate("/dashboard"); // Redirect to dashboard

        } catch (error) {
            console.error("Error during registration or login:", error);
            setError("Registration failed. Please try again.");
        } finally {
            setLoading(false); // Stop loading
        }
    };
 
    return (
        <div className="register-container">
            <h2>Register</h2>
            {error && <p className="error-message">{error}</p>}
            {loading ? (
                <Loader /> // Show Loader while registering
            ) : (
            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
                <button onClick={() => navigate("/login")}>Login</button>
            </form>
            )}
        </div>
    );
};

export default Register;
