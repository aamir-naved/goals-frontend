import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import axios from "axios";
const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";
import "./Dashboard.css"
import ChatModal from './ChatModal';


const Dashboard = () => {
    const navigate = useNavigate();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallAlert, setShowInstallAlert] = useState(false);
    const [users, setUsers] = useState([]);  // Initialize as an empty array
    const [partners, setPartners] = useState([]);
    const [partnerId, setPartnerId] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [partnerGoals, setPartnerGoals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    

    useEffect(() => {
        fetchUsers();
        fetchPartner();
        fetchPendingRequests();
        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
            setShowInstallAlert(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);


    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === "accepted") {
                    console.log("User accepted the install prompt");
                } else {
                    console.log("User dismissed the install prompt");
                }
                setDeferredPrompt(null);
                setShowInstallAlert(false);
            });
        }
    };


    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
            const response = await axios.get(`${API_BASE_URL}/api/accountability/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers([]);
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPartner = async () => {
        console.log("Fetching partner....")
        const token = localStorage.getItem("token");
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        console.log("Logged In user")
        console.log(user);
        
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/accountability/partners?userId=${user?.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("Request made to fetch partner: Response:-")
            console.log(response)

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                console.log("Received partners:", response.data);
                setPartners(response.data);  // Now storing multiple partners
            } else {
                console.log("No accountability partners found.");
                setPartners([]);
            }
        } catch (error) {
            console.error("Error fetching accountability partner:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${API_BASE_URL}/api/accountability/pending-requests?userId=${user?.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("We fetch pending request response:")
            console.log(response.data)
            setPendingRequests(response.data || []);
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPartnerGoals = async (partnerId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${API_BASE_URL}/api/accountability/partnerGoals?partnerId=${partnerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPartnerGoals(response.data || []);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching partner's goals:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async (receiverId) => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/accountability/send-request?senderId=${user?.id}&receiverId=${receiverId}`,
                {},  // Empty body since parameters are passed in the URL
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(response.data); // Backend returns a message string
            fetchUsers();
        } catch (error) {
            console.error("Error sending request:", error);
        }
    };

    const respondToRequest = async (senderId, accept) => {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/accountability/respond-request?receiverId=${senderId}&senderId=${user?.id}&accept=${accept}`,
                {},  // Empty body since parameters are passed in the URL
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(response.data); // Backend returns a message string
            fetchPartner(); // Refresh partner status
            fetchPendingRequests(); 
        } catch (error) {
            console.error("Error responding to request:", error);
        }
    };

    const removePartner = async (partnerId) => {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const token = localStorage.getItem("token");
        try {
            setLoading(true);
            const response = await axios.delete(
                `${API_BASE_URL}/api/accountability/remove-partner?userId=${user?.id}&partnerId=${partnerId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(response.data); // Backend returns a message string
            setPartners([]);
            setPartnerId(null); 
            console.log("Partner Removed Successfully.")
            fetchUsers();
        } catch (error) {
            console.error("Error removing partner:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
    };

    return (
        <div className="container">
            {loading && <Loader />} {/* Show loader while fetching data */}
            {showInstallAlert && (
                <div className="install-banner">
                    <p>Install this app for a better experience!</p>
                    <button onClick={handleInstallClick} className="install-btn">Install</button>
                </div>
            )}
            <h1>Hello There! {user?.name} 🙋</h1>

            <div className="button-group">
                <Link to="/goals">
                    <button className="view-goals">View Goals</button>
                </Link>
                <button onClick={handleLogout} className="logout">Logout</button>
            </div>

            {loading ? <Loader /> : partners.length > 0 ? (
                <div className="partner-section">
                    <h3>Current Accountability Partners:</h3>
                    <div className="partners-container">  {/* Added wrapper for scrolling */}
                        {partners.map((partner) => (
                            <div key={partner.id} className="partner-card">
                                <p><strong>Name:</strong> {partner.name}</p>
                                <p><strong>Email:</strong> {partner.email}</p>
                                <button onClick={() => removePartner(partner.id)} className="remove-partner">
                                    Remove Partner
                                </button>
                                <button onClick={() => fetchPartnerGoals(partner.id)} className="show-goals">
                                    View Goals
                                </button>
                                <button onClick={() => setSelectedPartner(partner)} className="chat-button">
                                    Text
                                </button>
                            </div>
                        ))}
                    </div>
                    {selectedPartner && (
                        <ChatModal partner={selectedPartner} userId={1234} onClose={() => setSelectedPartner(null)} />
                    )}
                </div>
            ) : (
                <p className="no-partner">You don't have an accountability partner yet.</p>
            )}


            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Partner's Goals</h2>
                        <button className="close-modal" onClick={() => setIsModalOpen(false)}>Close</button>
                        <div className="goal-list">
                            {loading ? (
                                <Loader />
                            ) : partnerGoals.length > 0 ? (
                                <ul>
                                    {partnerGoals.map((goal) => (
                                        <li key={goal.id}>{goal.title} - {goal.description}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No goals found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {loading ? <Loader /> : pendingRequests.length > 0 && (
                <div className="pending-requests">
                    <h2>Pending Requests</h2>
                    <ul>
                        {pendingRequests.map((request) => {
                            console.log("Pending Request:", request); // Debugging

                            return (
                                <li key={request.id} className="request-item">
                                    <span>{request.partnerName || "Unknown"}, ID - {request.partnerId } wants to be your accountability partner!</span>
                                    <div>
                                        <button onClick={() => respondToRequest(request.partnerId, true)} className="accept">
                                            Accept
                                        </button>
                                        <button onClick={() => respondToRequest(request.partnerId, false)} className="reject">
                                            Reject
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
            <h2>Available Users</h2>
            {loading ? <Loader /> : users.length === 0 ? (
                <p>No users available.</p>
            ) : (
                <div className="users-container">
                <ul className="users-list">
                    {users.map((user) => (
                        <li key={user.id} className="user-item">
                            <span>Name: {user.name}</span>
                            {user.id === partnerId ? (
                                <button onClick={removePartner} className="remove-partner">
                                    Remove Partner
                                </button>
                            ) : (
                                <button onClick={() => sendRequest(user.id)} className="send-request">Send Request</button>
                            )}
                        </li>
                    ))}
                </ul>
                </div>
            )}
        </div>
    );

};

export default Dashboard;
