import React, { useState, useEffect, useRef } from 'react';
import './ChatModal.css'; // Ensure styling for the modal

const WEBSOCKET_URL = "wss://goals-chat-func-production.up.railway.app/ws";

const ChatModal = ({ partner, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userIdNew = user?.id;
    const chatHistoryRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!userIdNew || !partner.id) return;

        const ws = new WebSocket(`${WEBSOCKET_URL}/${userIdNew}/${partner.id}`);
        socketRef.current = ws;

        ws.onopen = () => console.log("✅ WebSocket Connected");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.history) {
                setMessages(data.history.map(msg => ({
                    senderId: msg.sender, // Rename sender to senderId
                    content: msg.message  // Rename message to content
                })));
            } else {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { senderId: data.sender, content: data.message }
                ]);
            }
        };

        ws.onclose = () => console.log("❌ WebSocket Disconnected");

        return () => ws.close();
    }, [partner.id]);

    const sendMessage = () => {
        if (!newMessage.trim() || !socketRef.current) return;

        const messageData = {
            sender: userIdNew,
            message: newMessage,
        };

        socketRef.current.send(JSON.stringify(messageData));
        setNewMessage('');
    };

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat-modal-overlay">
            <div className="chat-modal">
                <button className="close-button" onClick={onClose}>X</button>
                <h3>Chat with {partner.name}</h3>
                <div className="chat-history">
                    {messages.map((msg, index) => {
                        const isSent = msg.senderId === userIdNew; // Check if the message was sent by the current user
                        return (
                            <div key={index} className={`message ${isSent ? 'sent' : 'received'}`}>
                                {msg.content}
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
