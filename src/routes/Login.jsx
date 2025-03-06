import { useState , useEffect} from "react";
import { loginUser } from "../api/auth"; 
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import axios from "axios";
const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";
import "./Login.css"

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard"); // Redirect if already logged in
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); 
        setLoading(true);
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
            if (error.response) {
                if (error.response.status === 401) {
                    setError("Invalid email or password. Please try again.");
                } else {
                    setError("Something went wrong. Please try again later.");
                }
            } else {
                setError("Network error. Please check your connection.");
            }
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
            {loading ? (
                <Loader /> // Show Loader while logging in
            ) : (
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
                <button onClick={() => navigate("/register")}>Register</button>
            </form>
            )}
        </div>
    );
};

export default Login;
