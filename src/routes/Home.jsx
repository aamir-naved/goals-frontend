import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <h1>Welcome to the Accountability App</h1>
            <div className="button-container">
                <button onClick={() => navigate("/register")}>Register</button>
                <button onClick={() => navigate("/login")}>Login</button>
            </div>
        </div>
    );
}

export default Home;
