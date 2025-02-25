import { useState } from "react";
import "./Chatbot.css";

function Chatbot() {
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    // const API_BASE_URL = "http://192.168.110.229:8000"; // Your local FastAPI backend
    const API_BASE_URL = "https://ae20-2401-4900-5aa9-68cc-1505-481a-1d16-a33d.ngrok-free.app"; // NEW ngrok URL

    const sendMessage = async () => {
        if (!message.trim()) return; // Prevent sending empty messages

        const userMessage = { sender: "You", text: message };
        setChatHistory([...chatHistory, userMessage]); // Update chat with user message

        try {
            const response = await fetch(`${API_BASE_URL}/chat/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: "user123",  // Dummy user ID
                    message: message,    // User's message
                }),
            });

            const data = await response.json();
            const botMessage = { sender: "AI Bot", text: data.response };

            setChatHistory((prevChat) => [...prevChat, botMessage]); // Update chat with AI response
            setMessage(""); // Clear input field
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = { sender: "AI Bot", text: "Error connecting to backend." };
            setChatHistory((prevChat) => [...prevChat, errorMessage]);
        }
    };

    return (
        <div className="chatbot-container">
            <h1>Chat with AI Bot</h1>
            <div className="chat-window">
                {chatHistory.map((chat, index) => (
                    <div key={index} className={`chat-message ${chat.sender === "You" ? "user" : "bot"}`}>
                        <strong>{chat.sender}: </strong>{chat.text}
                    </div>
                ))}
            </div>

            <div className="input-container">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default Chatbot;
