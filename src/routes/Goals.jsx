import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";
import "./Goals.css"

axios.defaults.withCredentials = true;

const Goals = () => {
    console.log("Inside Goals Component");
    const navigate = useNavigate();

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = localStorage.getItem("token");

    console.log("User:", user);
    console.log("Token:", token);

    const [goals, setGoals] = useState([]);
    const [editingGoal, setEditingGoal] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const [goalForm, setGoalForm] = useState({
        title: "",
        description: "",
        deadline: "",
        progress: 0,
        completed: false,
    });

    useEffect(() => {
        if (!user || !token) {
            navigate("/login"); // Redirect if not logged in
        }
    }, [user, token, navigate]);

    useEffect(() => {
        if (user?.id && token) {
            fetchGoals();
        } else {
            console.warn("User not authenticated or missing token."); 
        }
    }, [user?.id, token]);

    const fetchGoals = async () => {
        console.log("Fetching goals for User ID:", user?.id);
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/goals/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Goals Fetch Response:", response);
            if (response.status === 200 && Array.isArray(response.data)) {
                setGoals(response.data);
            } else {
                console.error("Unexpected response format:", response);
            }
        } catch (error) {
            console.error("Error fetching goals:", error.response?.data || error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGoalForm({
            ...goalForm,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id) {
            console.error("User ID is missing!");
            return;
        }

        const newGoal = { ...goalForm, userId: user.id };

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/goals`, newGoal, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Goal Created:", response);
            if (response.status === 200) {
                setGoals([...goals, response.data]);
                setShowAddForm(false); // Hide form after adding goal
                setGoalForm({ title: "", description: "", deadline: "", progress: 0, completed: false });

                // Scroll to the bottom after adding
                setTimeout(() => {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                }, 100); // Small delay to ensure DOM updates
            }
        } catch (error) {
            console.error("Error creating goal:", error.response?.data || error.message);
        }
    };

    const handleDelete = async (goalId) => {
        console.log("Deleting goal with ID:", goalId);
        try {
            await axios.delete(`${API_BASE_URL}/auth/goals/${goalId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setGoals(goals.filter((goal) => goal.id !== goalId));
        } catch (error) {
            console.error("Error deleting goal:", error.response?.data || error.message);
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setShowAddForm(false); // Hide add form when editing
        setGoalForm({
            title: goal.title,
            description: goal.description,
            deadline: goal.deadline,
            progress: goal.progress,
            completed: goal.completed,
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingGoal) return;

        try {
            const updatedGoal = { ...goalForm, userId: user.id };

            const response = await axios.put(
                `${API_BASE_URL}/auth/goals/${editingGoal.id}`,
                updatedGoal,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Goal Updated:", response);

            if (response.status === 200) {
                setGoals(goals.map((goal) => (goal.id === editingGoal.id ? response.data : goal)));
                setEditingGoal(null);
                setGoalForm({ title: "", description: "", deadline: "", progress: 0, completed: false });
            }
        } catch (error) {
            console.error("Error updating goal:", error.response?.data || error.message);
        }
    };

    // return (
    //     <div>
    //         {/* Back to Dashboard Button */}
    //         <button
    //             onClick={() => navigate("/dashboard")}
    //             className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
    //         >
    //             Back to Dashboard
    //         </button>
    //         <h2>Your Goals</h2>

    //         {/* Add New Goal Button */}
    //         <button onClick={() => { setShowAddForm(true); setEditingGoal(null); }}>
    //             Add New Goal
    //         </button>

    //         {/* Add New Goal Form */}
    //         {showAddForm && (
    //             <div>
    //                 <h3>Add New Goal</h3>
    //                 <form onSubmit={handleSubmit}>
    //                     <input
    //                         type="text"
    //                         name="title"
    //                         value={goalForm.title}
    //                         onChange={handleInputChange}
    //                         placeholder="Title"
    //                         required
    //                     />
    //                     <textarea
    //                         name="description"
    //                         value={goalForm.description}
    //                         onChange={handleInputChange}
    //                         placeholder="Description"
    //                     />
    //                     <input
    //                         type="date"
    //                         name="deadline"
    //                         value={goalForm.deadline}
    //                         onChange={handleInputChange}
    //                         required
    //                     />
    //                     <input
    //                         type="number"
    //                         name="progress"
    //                         value={goalForm.progress}
    //                         onChange={handleInputChange}
    //                         min="0"
    //                         max="100"
    //                     />
    //                     <label>
    //                         Completed:
    //                         <input
    //                             type="checkbox"
    //                             name="completed"
    //                             checked={goalForm.completed}
    //                             onChange={handleInputChange}
    //                         />
    //                     </label>
    //                     <button type="submit">Save Goal</button>
    //                     <button onClick={() => setShowAddForm(false)}>Cancel</button>
    //                 </form>
    //             </div>
    //         )}

    //         {/* Edit Goal Form */}
    //         {editingGoal && (
    //             <div>
    //                 <h3>Edit Goal</h3>
    //                 <form onSubmit={handleUpdate}>
    //                     <input
    //                         type="text"
    //                         name="title"
    //                         value={goalForm.title}
    //                         onChange={handleInputChange}
    //                         placeholder="Title"
    //                         required
    //                     />
    //                     <textarea
    //                         name="description"
    //                         value={goalForm.description}
    //                         onChange={handleInputChange}
    //                         placeholder="Description"
    //                     />
    //                     <input
    //                         type="date"
    //                         name="deadline"
    //                         value={goalForm.deadline}
    //                         onChange={handleInputChange}
    //                         required
    //                     />
    //                     <input
    //                         type="number"
    //                         name="progress"
    //                         value={goalForm.progress}
    //                         onChange={handleInputChange}
    //                         min="0"
    //                         max="100"
    //                     />
    //                     <label>
    //                         Completed:
    //                         <input
    //                             type="checkbox"
    //                             name="completed"
    //                             checked={goalForm.completed}
    //                             onChange={handleInputChange}
    //                         />
    //                     </label>
    //                     <button type="submit">Update Goal</button>
    //                     <button onClick={() => setEditingGoal(null)}>Cancel</button>
    //                 </form>
    //             </div>
    //         )}

    //         {/* Goals List */}
    //         <ul>
    //             {goals.map((goal) => (
    //                 <li key={goal.id}>
    //                     <h3>{goal.title}</h3>
    //                     <p>{goal.description}</p>
    //                     <p>Deadline: {goal.deadline}</p>
    //                     <p>Progress: {goal.progress}%</p>
    //                     <p>Status: {goal.completed ? "Completed" : "In Progress"}</p>
    //                     <button onClick={() => handleEdit(goal)}>Edit</button>
    //                     <button onClick={() => handleDelete(goal.id)}>Delete</button>
    //                 </li>
    //             ))}
    //         </ul>
    //     </div>
    // );
     
    return (
        <div className="container">
            {/* Back to Dashboard Button */}
            <button
                onClick={() => navigate("/dashboard")}
                className="bg-blue-500"
            >
                Back to Dashboard
            </button>

            <h2>Your Goals</h2>

            {/* Add New Goal Button */}
            <button
                onClick={() => { setShowAddForm(true); setEditingGoal(null); }}
                className="add-goal-btn"
            >
                Add New Goal
            </button>

            {/* Add New Goal Form */}
            {showAddForm && (
                <div className="form-container">
                    <h3>Add New Goal</h3>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="title"
                            value={goalForm.title}
                            onChange={handleInputChange}
                            placeholder="Title"
                            required
                        />
                        <textarea
                            name="description"
                            value={goalForm.description}
                            onChange={handleInputChange}
                            placeholder="Description"
                        />
                        <input
                            type="date"
                            name="deadline"
                            value={goalForm.deadline}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="number"
                            name="progress"
                            value={goalForm.progress}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                        />
                        <label>
                            Completed:
                            <input
                                type="checkbox"
                                name="completed"
                                checked={goalForm.completed}
                                onChange={handleInputChange}
                            />
                        </label>
                        <button type="submit" className="add-goal-btn">Save Goal</button>
                        <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
                    </form>
                </div>
            )}

            {/* Edit Goal Form */}
            {editingGoal && (
                <div className="form-container">
                    <h3>Edit Goal</h3>
                    <form onSubmit={handleUpdate}>
                        <input
                            type="text"
                            name="title"
                            value={goalForm.title}
                            onChange={handleInputChange}
                            placeholder="Title"
                            required
                        />
                        <textarea
                            name="description"
                            value={goalForm.description}
                            onChange={handleInputChange}
                            placeholder="Description"
                        />
                        <input
                            type="date"
                            name="deadline"
                            value={goalForm.deadline}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="number"
                            name="progress"
                            value={goalForm.progress}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                        />
                        <label>
                            Completed:
                            <input
                                type="checkbox"
                                name="completed"
                                checked={goalForm.completed}
                                onChange={handleInputChange}
                            />
                        </label>
                        <button type="submit" className="edit-btn">Update Goal</button>
                        <button onClick={() => setEditingGoal(null)} className="cancel-btn">Cancel</button>
                    </form>
                </div>
            )}

            {/* Goals List */}
            <ul className="goal-list">
                {goals.map((goal) => (
                    <li key={goal.id} className="goal-item">
                        <h3>{goal.title}</h3>
                        <p>{goal.description}</p>
                        <p>Deadline: {goal.deadline}</p>
                        <p>Progress: {goal.progress}%</p>
                        <p>Status: {goal.completed ? "Completed" : "In Progress"}</p>
                        <button onClick={() => handleEdit(goal)} className="edit-btn">Edit</button>
                        <button onClick={() => handleDelete(goal.id)} className="delete-btn">Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );


};

export default Goals;
