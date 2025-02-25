import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import axios from "axios";
import ChatModal from "./ChatModal";
import "./Dashboard.css";

const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";

const Dashboard = () => {
    const navigate = useNavigate();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallAlert, setShowInstallAlert] = useState(false);
    const [users, setUsers] = useState([]);
    const [partners, setPartners] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [partnerGoals, setPartnerGoals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [error, setError] = useState(null); // Added for error handling
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    useEffect(() => {
        if (!user) {
            navigate("/login"); // Redirect if no user
            return;
        }
        fetchUsers();
        fetchPartner();
        fetchPendingRequests();

        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
            setShowInstallAlert(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }, [navigate, user]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User ${outcome === "accepted" ? "accepted" : "dismissed"} the install prompt`);
        setDeferredPrompt(null);
        setShowInstallAlert(false);
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/api/accountability/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setError("Failed to fetch users. Please try again.");
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPartner = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${API_BASE_URL}/api/accountability/partners?userId=${user?.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPartners(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setError("Failed to fetch partners. Please try again.");
            console.error("Error fetching partners:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${API_BASE_URL}/api/accountability/pending-requests?userId=${user?.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPendingRequests(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setError("Failed to fetch pending requests. Please try again.");
            console.error("Error fetching pending requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPartnerGoals = async (partnerId) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${API_BASE_URL}/api/accountability/partnerGoals?partnerId=${partnerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPartnerGoals(Array.isArray(response.data) ? response.data : []);
            setIsModalOpen(true);
        } catch (error) {
            setError("Failed to fetch partner goals. Please try again.");
            console.error("Error fetching partner goals:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async (receiverId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${API_BASE_URL}/api/accountability/send-request?senderId=${user?.id}&receiverId=${receiverId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(response.data);
            fetchUsers();
            fetchPendingRequests();
        } catch (error) {
            console.error("Error sending request:", error);
            alert("Failed to send request.");
        }
    };

    const respondToRequest = async (senderId, accept) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${API_BASE_URL}/api/accountability/respond-request?receiverId=${senderId}&senderId=${user?.id}&accept=${accept}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(response.data);
            fetchPartner();
            fetchPendingRequests();
        } catch (error) {
            console.error("Error responding to request:", error);
            alert("Failed to respond to request.");
        }
    };

    const removePartner = async (partnerId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(
                `${API_BASE_URL}/api/accountability/remove-partner?userId=${user?.id}&partnerId=${partnerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(response.data);
            setPartners(partners.filter((p) => p.id !== partnerId));
            fetchUsers();
        } catch (error) {
            console.error("Error removing partner:", error);
            alert("Failed to remove partner.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="dashboard">
            {loading && <Loader />}
            {showInstallAlert && (
                <div className="install-banner">
                    <p>Install this app for a better experience!</p>
                    <button onClick={handleInstallClick} className="install-btn">Install</button>
                </div>
            )}
            <header className="dashboard-header">
                <h1>Hello, {user?.name}! 🙋</h1>
                <div className="button-group">
                    <Link to="/goals"><button className="btn btn-primary">View Goals</button></Link>
                    <button onClick={() => navigate("/prayer-times")} className="btn btn-secondary">Prayer Times</button>
                    <button onClick={handleLogout} className="btn btn-danger">Logout</button>
                </div>
            </header>

            {error && <div className="error-message">{error}</div>}

            <section className="partners-section">
                <h2>Your Accountability Partners</h2>
                {partners.length > 0 ? (
                    <div className="partners-container">
                        {partners.map((partner) => (
                            <div key={partner.id} className="partner-card">
                                <div className="partner-info">
                                    <p><strong>{partner.name}</strong></p>
                                    <p>{partner.email}</p>
                                </div>
                                <div className="partner-actions">
                                    <button onClick={() => fetchPartnerGoals(partner.id)} className="btn btn-info">View Goals</button>
                                    <button onClick={() => setSelectedPartner(partner)} className="btn btn-chat">Chat</button>
                                    <button onClick={() => removePartner(partner.id)} className="btn btn-danger">Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No accountability partners yet.</p>
                )}
            </section>

            {selectedPartner && (
                <ChatModal partner={selectedPartner} onClose={() => setSelectedPartner(null)} />
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Partner's Goals</h2>
                        <button className="btn btn-close" onClick={() => setIsModalOpen(false)}>✖</button>
                        <div className="goal-list">
                            {loading ? (
                                <Loader />
                            ) : partnerGoals.length > 0 ? (
                                <ul>
                                    {partnerGoals.map((goal) => (
                                        <li key={goal.id}>
                                            <strong>{goal.title}</strong>: {goal.description}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No goals found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <section className="pending-section">
                <h2>Pending Requests</h2>
                {pendingRequests.length > 0 ? (
                    <ul className="pending-list">
                        {pendingRequests.map((request) => (
                            <li key={request.id} className="pending-item">
                                <span>{request.partnerName || "Unknown"} (ID: {request.partnerId})</span>
                                <div className="pending-actions">
                                    <button onClick={() => respondToRequest(request.partnerId, true)} className="btn btn-success">Accept</button>
                                    <button onClick={() => respondToRequest(request.partnerId, false)} className="btn btn-danger">Reject</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-data">No pending requests.</p>
                )}
            </section>

            <section className="users-section">
                <h2>Available Users</h2>
                {users.length > 0 ? (
                    <div className="users-container">
                        <ul className="users-list">
                            {users.map((user) => (
                                <li key={user.id} className="user-item">
                                    <span>{user.name}</span>
                                    <button onClick={() => sendRequest(user.id)} className="btn btn-primary">Send Request</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="no-data">No users available.</p>
                )}
            </section>
        </div>
    );
};

export default Dashboard;