import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";
import "./Dashboard.css"


const Dashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);  // Initialize as an empty array
    const [partners, setPartners] = useState([]);
    const [partnerId, setPartnerId] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [partnerGoals, setPartnerGoals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    

    useEffect(() => {
        fetchUsers();
        fetchPartner();
        fetchPendingRequests();
    }, []);



    const fetchUsers = async () => {
        try {
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
        }
    };

    const fetchPartner = async () => {
        console.log("Fetching partner....")
        const token = localStorage.getItem("token");
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
        }
    };

    const fetchPendingRequests = async () => {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        try {
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
        }
    };

    const fetchPartnerGoals = async (partnerId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${API_BASE_URL}/api/accountability/partnerGoals?partnerId=${partnerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPartnerGoals(response.data || []);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching partner's goals:", error);
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
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
    };

    // return (
    //     <div className="container mx-auto p-4">
    //         <h2 className="text-2xl font-bold mb-4">Dashboard , Hello {user?.name}, ID - {user?.id}</h2>

    //         <div className="mb-4">
    //             <Link to="/goals">
    //                 <button className="bg-blue-500 text-white px-4 py-2 mr-2">View Goals</button>
    //             </Link>
    //             <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2">
    //                 Logout
    //             </button>
    //         </div>

    //         {partner ? (
    //             <div className="p-4 bg-green-200 rounded mb-4">
    //                 <p><strong>Current Accountability Partner:</strong> {partner.name}</p>
    //                 <button onClick={removePartner} className="bg-red-500 text-white px-4 py-2 mt-2">Remove Partner</button>
    //             </div>
    //         ) : (
    //             <p className="mb-4">You don't have an accountability partner yet.</p>
    //         )}


    //         {/* ✅ Pending Requests Section */}
    //         {pendingRequests.length > 0 && (
    //             <div className="p-4 bg-yellow-100 rounded mb-4">
    //                 <h2 className="text-xl font-semibold mb-2">Pending Requests</h2>
    //                 <ul>
    //                     {pendingRequests.map((request) => (
    //                         <li key={request.id} className="flex justify-between items-center p-2 border-b">
    //                             <span>{request.user.name} wants to be your accountability partner</span>
    //                             <div>
    //                                 <button onClick={() => respondToRequest(request.user.id, true)} className="bg-green-500 text-white px-3 py-1 rounded-md mr-2">
    //                                     Accept
    //                                 </button>
    //                                 <button onClick={() => respondToRequest(request.user.id, false)} className="bg-red-500 text-white px-3 py-1 rounded-md">
    //                                     Reject
    //                                 </button>
    //                             </div>
    //                         </li>
    //                     ))}
    //                 </ul>
    //             </div>
    //         )}
            

    //         <h2 className="text-xl font-semibold mb-2">Available Users</h2>
    //         {users.length === 0 ? (
    //             <p>No users available.</p>
    //         ) : (
    //             <ul className="space-y-2">
    //                 {users.map((user) => (
    //                     <li key={user.id} className="p-3 bg-gray-100 rounded flex justify-between items-center">
    //                         <span>Name: {user.name}</span>
    //                         <span>, User Id {user.id}</span>
    //                         <span></span>

    //                         {user.id === partnerId ? (
    //                             <button onClick={removePartner} className="bg-red-500 text-white px-4 py-2">
    //                                 Remove Partner
    //                             </button>
    //                         ) : (
    //                             <button onClick={() => sendRequest(user.id)} className="bg-blue-500 text-white px-3 py-1">Send Request</button>
    //                         )}
    //                     </li>
    //                 ))}
    //             </ul>
    //         )}

    //     </div>
    // );

    return (
        <div className="container">
            <h2>Dashboard , Hello {user?.name}, ID - {user?.id}</h2>

            <div className="button-group">
                <Link to="/goals">
                    <button className="view-goals">View Goals</button>
                </Link>
                <button onClick={handleLogout} className="logout">Logout</button>
            </div>

            {partners.length > 0 ? (
                <div className="partner-section">
                    <h3>Current Accountability Partners:</h3>
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
                        </div>
                    ))}
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
                            {partnerGoals.length > 0 ? (
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
            {pendingRequests.length > 0 && (
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
            {users.length === 0 ? (
                <p>No users available.</p>
            ) : (
                <ul className="users-list">
                    {users.map((user) => (
                        <li key={user.id} className="user-item">
                            <span>Name: {user.name}</span>
                            <span>, User Id {user.id}</span>

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
            )}
        </div>
    );

};

export default Dashboard;
