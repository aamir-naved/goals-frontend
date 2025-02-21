import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";


const Dashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);  // Initialize as an empty array
    const [partner, setPartner] = useState(null);
    const [partnerId, setPartnerId] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
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
                `${API_BASE_URL}/api/accountability/partner?userId=${user?.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("Request made: ")

            if (response.data && response.data !== "No active accountability partner found.") {
                const accountabilityPartner = response.data;

                // Determine the actual partner (not the logged-in user)
                const actualPartner =
                    accountabilityPartner.user.id === user.id
                        ? accountabilityPartner.partner
                        : accountabilityPartner.user;

                console.log("Extracted partner:", actualPartner);
                setPartner(actualPartner);
                setPartnerId(actualPartner.id);
            } else {
                console.log("Else block of response");
                setPartner(null);
                setPartnerId(null);
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
            setPendingRequests(response.data || []);
        } catch (error) {
            console.error("Error fetching pending requests:", error);
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
                `${API_BASE_URL}/api/accountability/respond-request?receiverId=${user?.id}&senderId=${senderId}&accept=${accept}`,
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

    const removePartner = async () => {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const token = localStorage.getItem("token");
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/api/accountability/remove-partner?userId=${user?.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(response.data); // Backend returns a message string
            setPartner(null);
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

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Dashboard , Hello {user?.name}, ID - {user?.id}</h2>

            <div className="mb-4">
                <Link to="/goals">
                    <button className="bg-blue-500 text-white px-4 py-2 mr-2">View Goals</button>
                </Link>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2">
                    Logout
                </button>
            </div>

            {partner ? (
                <div className="p-4 bg-green-200 rounded mb-4">
                    <p><strong>Current Accountability Partner:</strong> {partner.name}</p>
                    <button onClick={removePartner} className="bg-red-500 text-white px-4 py-2 mt-2">Remove Partner</button>
                </div>
            ) : (
                <p className="mb-4">You don't have an accountability partner yet.</p>
            )}


            {/* ✅ Pending Requests Section */}
            {pendingRequests.length > 0 && (
                <div className="p-4 bg-yellow-100 rounded mb-4">
                    <h2 className="text-xl font-semibold mb-2">Pending Requests</h2>
                    <ul>
                        {pendingRequests.map((request) => (
                            <li key={request.id} className="flex justify-between items-center p-2 border-b">
                                <span>{request.user.name} wants to be your accountability partner</span>
                                <div>
                                    <button onClick={() => respondToRequest(request.user.id, true)} className="bg-green-500 text-white px-3 py-1 rounded-md mr-2">
                                        Accept
                                    </button>
                                    <button onClick={() => respondToRequest(request.user.id, false)} className="bg-red-500 text-white px-3 py-1 rounded-md">
                                        Reject
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            

            <h2 className="text-xl font-semibold mb-2">Available Users</h2>
            {users.length === 0 ? (
                <p>No users available.</p>
            ) : (
                <ul className="space-y-2">
                    {users.map((user) => (
                        <li key={user.id} className="p-3 bg-gray-100 rounded flex justify-between items-center">
                            <span>Name: {user.name}</span>
                            <span>, User Id {user.id}</span>
                            <span></span>

                            {user.id === partnerId ? (
                                <button onClick={removePartner} className="bg-red-500 text-white px-4 py-2">
                                    Remove Partner
                                </button>
                            ) : (
                                <button onClick={() => sendRequest(user.id)} className="bg-blue-500 text-white px-3 py-1">Send Request</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

        </div>
    );
};

export default Dashboard;
