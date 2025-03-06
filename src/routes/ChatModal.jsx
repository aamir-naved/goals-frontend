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
        if (!userIdNew || !partner.id) {
            console.warn("🚨 Missing userId or partnerId. WebSocket not initialized.");
            return;
        }

        console.log(`🔌 Connecting to WebSocket: ${WEBSOCKET_URL}/${userIdNew}/${partner.id}`);
        const ws = new WebSocket(`${WEBSOCKET_URL}/${userIdNew}/${partner.id}`);
        socketRef.current = ws;

        ws.onopen = () => console.log("✅ WebSocket Connected");

        ws.onmessage = (event) => {
            console.log("📩 WebSocket Message Received:", event.data);

            try {
                const data = JSON.parse(event.data);

                if (data.history) {
                    console.log("📜 Received Chat History:", data.history);

                    setMessages(data.history.map(msgStr => {
                        try {
                            const msg = typeof msgStr === 'string' ? JSON.parse(msgStr) : msgStr;
                            return {
                                senderId: msg.sender,
                                content: typeof msg.message === 'string' ? msg.message : JSON.parse(msg.message).message
                            };
                        } catch (error) {
                            console.error("❌ Error Parsing Individual History Message:", msgStr, error);
                            return null;
                        }
                    }).filter(msg => msg !== null));
                } else {
                    let msg = typeof data === 'string' ? JSON.parse(data) : data; // Ensure correct parsing
                    console.log("📨 New Incoming Message:", msg);

                    setMessages(prevMessages => [
                        ...prevMessages,
                        { senderId: msg.sender, content: msg.message }
                    ]);
                }
            } catch (error) {
                console.error("❌ Error Parsing WebSocket Message:", event.data, error);
            }

        };

        ws.onclose = () => console.log("❌ WebSocket Disconnected");

        return () => {
            console.log("🔌 Closing WebSocket Connection");
            ws.close();
        };
    }, [partner.id]);

    const sendMessage = () => {
        if (!newMessage.trim()) {
            console.warn("🚨 Cannot send an empty message.");
            return;
        }

        if (!socketRef.current) {
            console.warn("🚨 WebSocket is not connected.");
            return;
        }

        const messageData = {
            sender: userIdNew,
            message: newMessage,
        };

        console.log("📤 Sending Message:", messageData);
        socketRef.current.send(JSON.stringify(messageData));

        setMessages(prevMessages => {
            console.log("💾 Updating Messages State with Sent Message");
            return [
                ...prevMessages,
                { senderId: userIdNew, content: newMessage } // Ensure sent messages appear
            ];
        });

        setNewMessage('');
    };

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
        console.log("📝 Updated Messages State:", messages);
    }, [messages]); // Scroll only when messages update

    return (
        <div className="chat-modal-overlay">
            <div className="chat-modal">
                <button className="close-button" onClick={onClose}>X</button>
                <h3>Chat with {partner.name}</h3>
                <div className="chat-history" ref={chatHistoryRef}>
                    {messages.map((msg, index) => {
                        const isSent = msg.senderId === userIdNew;
                        const finalMessage = typeof msg.content === 'string' ? msg.content : JSON.parse(msg.content).message;

                        return (
                            <div key={index} className={`message ${isSent ? 'sent' : 'received'}`}>
                                {finalMessage}
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
