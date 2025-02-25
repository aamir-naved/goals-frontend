import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatModal.css';

const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";

const ChatModal = ({ partner, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?.id;
    const chatHistoryRef = useRef(null);

    // Fetch messages only once when the modal opens or partner changes
    useEffect(() => {
        fetchMessages();
    }, [partner.id]);

    const fetchMessages = async () => {
        const token = localStorage.getItem("token");
        if (!token || !userId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/messages/${userId}/${partner.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(response.data || []);
        } catch (error) {
            setError("Failed to load messages. Please try again.");
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        const token = localStorage.getItem("token");
        const messageData = {
            senderId: userId,
            receiverId: partner.id,
            content: newMessage,
        };

        setLoading(true);
        setError(null);
        try {
            await axios.post(`${API_BASE_URL}/api/messages`, messageData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setNewMessage('');
            fetchMessages(); // Refresh messages after sending
        } catch (error) {
            setError("Failed to send message. Please try again.");
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key to send message
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat-modal-overlay">
            <div className="chat-modal">
                <div className="chat-header">
                    <h3>Chat with {partner.name}</h3>
                    <button className="close-btn" onClick={onClose} aria-label="Close chat">✖</button>
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="chat-history" ref={chatHistoryRef}>
                    {loading ? (
                        <div className="loading">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="no-messages">No messages yet. Start the conversation!</div>
                    ) : (
                        messages.map((msg, index) => {
                            const isSent = msg.senderId === userId;
                            return (
                                <div key={index} className={`message ${isSent ? 'sent' : 'received'}`}>
                                    <span className="message-content">{msg.content}</span>
                                    <span className="message-time">
                                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="chat-input">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows="2"
                        disabled={loading}
                    />
                    <button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;