import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatModal.css'; // Ensure styling for the modal

const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";

const ChatModal = ({ partner, userId, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Fetch initial chat history
        axios.get(`${API_BASE_URL}/api/messages/${userId}/${partner.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => setMessages(response.data))
            .catch(error => console.error("Error fetching messages:", error));

        // Set up SSE for real-time updates
        const eventSource = new EventSource(`${API_BASE_URL}/api/messages/stream/${userId}`);
        eventSource.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data);
            if (
                (receivedMessage.senderId === userId && receivedMessage.receiverId === partner.id) ||
                (receivedMessage.senderId === partner.id && receivedMessage.receiverId === userId)
            ) {
                setMessages(prevMessages => [...prevMessages, receivedMessage]);
            }
        };

        return () => {
            eventSource.close();
        };
    }, [partner.id, userId]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        const token = localStorage.getItem("token");

        const messageData = {
            senderId: userId,
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
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="chat-modal">
            <div className="chat-content">
                <button className="close-button" onClick={onClose}>X</button>
                <h3>Chat with {partner.name}</h3>
                <div className="chat-history">
                    {messages.map((msg, index) => (
                        <div key={index} className={msg.senderId === userId ? 'message sent' : 'message received'}>
                            {msg.content}
                        </div>
                    ))}
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
