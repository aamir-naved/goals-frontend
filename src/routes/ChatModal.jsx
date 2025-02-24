import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatModal.css'; // Ensure styling for the modal

const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";

const ChatModal = ({ partner, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userIdNew = user?.id;

    useEffect(() => {
        fetchMessages();
    }, [partner.id, messages.length]);  // Re-fetch messages when partner changes or new message is added

    const fetchMessages = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/api/messages/${userIdNew}/${partner.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("📥 Fetched messages:", response.data);
            setMessages(response.data);
        } catch (error) {
            console.error("❌ Error fetching messages:", error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        const token = localStorage.getItem("token");

        const messageData = {
            senderId: userIdNew,
            receiverId: partner.id,
            content: newMessage
        };

        try {
            await axios.post(`${API_BASE_URL}/api/messages`, messageData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            setNewMessage('');
            fetchMessages(); // Fetch messages again after sending
        } catch (error) {
            console.error("❌ Error sending message:", error);
        }
    };

    return (
        <div className="chat-modal-overlay">
            <div className="chat-modal">
                <button className="close-button" onClick={onClose}>X</button>
                <h3>Chat with {partner.name}</h3>
                <div className="chat-history">
                    {messages.map((msg, index) => {
                        const isSent = msg.senderId === userIdNew;
                        return (
                            <div key={index} className={`message ${isSent ? 'sent' : 'received'}`}>
                                {msg.content}
                                {/* Debugging Info */}
                                <span className="debug-info">({msg.senderId} → {msg.receiverId})</span>
                            </div>
                        );
                    })}
                </div>
                <div className="chat-input">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
