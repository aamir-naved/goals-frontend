import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";
import "./Register.css";

const Register = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // const handleRegister = async (e) => {
    //     e.preventDefault();
    //     setError(null);

    //     try {
    //         const response = await fetch("http://localhost:8080/auth/register", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ email, name, password }),
    //         });

    //         if (!response.ok) {
    //             throw new Error("Registration failed");
    //         }

    //         const data = await response.text(); // Your API returns a string response
    //         console.log(data);
    //         alert("Registration successful! Please log in.");
    //         navigate("/login"); // Redirect to login page

    //     } catch (err) {
    //         console.error("Error:", err);
    //         setError("Registration failed. Try again.");
    //     }
    // };
    const handleRegister = async (e) => {
        e.preventDefault();
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
        }
    };

    // return (

    //     <div>
    //         <h2>Register</h2>
    //         {error && <p style={{ color: "red" }}>{error}</p>}
    //         <form onSubmit={handleRegister}>
    //             <input
    //                 type="email"
    //                 placeholder="Email"
    //                 value={email}
    //                 onChange={(e) => setEmail(e.target.value)}
    //                 required
    //             />
    //             <input
    //                 type="text"
    //                 placeholder="Name"
    //                 value={name}
    //                 onChange={(e) => setName(e.target.value)}
    //                 required
    //             />
    //             <input
    //                 type="password"
    //                 placeholder="Password"
    //                 value={password}
    //                 onChange={(e) => setPassword(e.target.value)}
    //                 required
    //             />
    //             <button type="submit">Register</button>
    //         </form>
    //     </div>
    // );
    return (
        <div className="register-container">
            <h2>Register</h2>
            {error && <p>{error}</p>}
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
        </div>
    );
};

export default Register;
