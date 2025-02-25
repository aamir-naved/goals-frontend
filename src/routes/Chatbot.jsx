import { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

function Chatbot() {
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [userGoals, setUserGoals] = useState([]);
    const [newGoals, setNewGoals] = useState("");

    const API_BASE_URL = "https://5209-103-208-104-167.ngrok-free.app"; // ngrok URL

    // 🔹 Send a message to the chatbot
    const sendMessage = async () => {
        if (!message.trim()) return;
        console.log( "Send message....")

        const userMessage = { sender: "You", text: message };
        setChatHistory([...chatHistory, userMessage]);

        try {
            const response = await axios.post(`${API_BASE_URL}/chat/`, {
                user_id: "user123",
                message: message,
            });

            const botMessage = { sender: "AI Bot", text: response.data.summary };
            console.log(response)
            setChatHistory((prevChat) => [...prevChat, botMessage]);
            setMessage("");
        } catch (error) {
            console.error("Chat Error:", error);
            setChatHistory((prevChat) => [...prevChat, { sender: "AI Bot", text: "Error connecting to backend." }]);
        }
    };

    // 🔹 Set user goals
    const setGoals = async () => {
        if (!newGoals.trim()) return;

        const goalList = newGoals.split(",").map(goal => goal.trim());

        try {
            await axios.post(`${API_BASE_URL}/set_goals/`, {
                user_id: "user123",
                goals: goalList,
            });
            console.log()


            setUserGoals(goalList);
            setNewGoals(""); // Clear input field
        } catch (error) {
            console.error("Set Goals Error:", error);
        }
    };

    // 🔹 Get user goals
    const getGoals = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/get_goals/user123`);
            setUserGoals(response.data.goals);
            console.log()

        } catch (error) {
            console.error("Get Goals Error:", error);
        }
    };

    // 🔹 Delete user goals
    const deleteGoals = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/delete_goals/user123`);
            setUserGoals([]); // Clear the state
        } catch (error) {
            console.error("Delete Goals Error:", error);
        }
    };

    return (
        <div className="chatbot-container">
            <h1>Chat with AI Bot</h1>

            {/* Chat Window */}
            <div className="chat-window">
                {chatHistory.map((chat, index) => (
                    <div key={index} className={`chat-message ${chat.sender === "You" ? "user" : "bot"}`}>
                        <strong>{chat.sender}: </strong>{chat.text}
                    </div>
                ))}
            </div>

            {/* Chat Input */}
            <div className="input-container">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>

            {/* Goal Management */}
            <div className="goal-section">
                <h2>Manage Goals</h2>

                <input
                    type="text"
                    placeholder="Enter goals (comma-separated)"
                    value={newGoals}
                    onChange={(e) => setNewGoals(e.target.value)}
                />
                <button onClick={setGoals}>Set Goals</button>

                <button onClick={getGoals}>Get Goals</button>
                <button onClick={deleteGoals}>Delete Goals</button>

                {userGoals.length > 0 && (
                    <div className="goal-list">
                        <h3>Your Goals:</h3>
                        <ul>
                            {userGoals.map((goal, index) => (
                                <li key={index}>{goal}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chatbot;
