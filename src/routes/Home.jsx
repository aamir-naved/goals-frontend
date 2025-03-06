import { useNavigate } from "react-router-dom";
import "./Home.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <h1>Welcome to the Accountability App</h1>
            <div className="button-container">
                <button onClick={() => navigate("/register")}>Register</button>
                <button onClick={() => navigate("/login")}>Login</button>
                <button className="prayer" onClick={() => navigate("/prayer-times")}>Prayer Times</button>
                {/* <button onClick={() => navigate("/chatbot")}>Chat with AI Bot</button> */}
            </div>
        </div>
    );
}

export default Home;
