import { useState } from "react";
import { loginUser } from "../api/auth"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";
import "./Login.css"

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });

            const { token, user } = response.data; // Get both token and user
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user)); // Store user object

            navigate("/dashboard"); // Redirect to dashboard
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    // return (
    //     <div>
    //         <h2>Login</h2>
    //         {error && <p style={{ color: "red" }}>{error}</p>}
    //         <form onSubmit={handleLogin}>
    //             <input
    //                 type="email"
    //                 placeholder="Email"
    //                 value={email}
    //                 onChange={(e) => setEmail(e.target.value)}
    //                 required
    //             />
    //             <input
    //                 type="password"
    //                 placeholder="Password"
    //                 value={password}
    //                 onChange={(e) => setPassword(e.target.value)}
    //                 required
    //             />
    //             <button type="submit">Login</button>
    //         </form>
    //     </div>
    // );

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p>{error}</p>}
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
