import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Goals.css";

const API_BASE_URL = "https://goals-app-production-49b0.up.railway.app";
axios.defaults.withCredentials = true;

const Goals = () => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = localStorage.getItem("token");

    const [goals, setGoals] = useState([]);
    const [editingGoal, setEditingGoal] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [goalForm, setGoalForm] = useState({
        title: "",
        description: "",
        deadline: "",
        progress: 0,
        completed: false,
    });

    useEffect(() => {
        if (!user || !token) {
            navigate("/login");
        } else {
            fetchGoals();
        }
    }, [user, token, navigate]);

    const fetchGoals = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/goals/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (Array.isArray(response.data)) {
                setGoals(response.data);
            } else {
                setError("Unexpected response format from server.");
            }
        } catch (error) {
            setError("Failed to fetch goals. Please try again.");
            console.error("Error fetching goals:", error.response?.data || error.message);
        } finally {
            setLoading(false);
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
        if (!user?.id) return;

        const newGoal = { ...goalForm, userId: user.id };
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/goals`, newGoal, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoals([...goals, response.data]);
            setShowAddForm(false);
            setGoalForm({ title: "", description: "", deadline: "", progress: 0, completed: false });
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            }, 100);
        } catch (error) {
            setError("Failed to create goal. Please try again.");
            console.error("Error creating goal:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (goalId) => {
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`${API_BASE_URL}/auth/goals/${goalId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoals(goals.filter((goal) => goal.id !== goalId));
        } catch (error) {
            setError("Failed to delete goal. Please try again.");
            console.error("Error deleting goal:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setShowAddForm(false);
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

        setLoading(true);
        setError(null);
        try {
            const updatedGoal = { ...goalForm, userId: user.id };
            const response = await axios.put(
                `${API_BASE_URL}/auth/goals/${editingGoal.id}`,
                updatedGoal,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setGoals(goals.map((goal) => (goal.id === editingGoal.id ? response.data : goal)));
            setEditingGoal(null);
            setGoalForm({ title: "", description: "", deadline: "", progress: 0, completed: false });
        } catch (error) {
            setError("Failed to update goal. Please try again.");
            console.error("Error updating goal:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="goals-container">
            <header className="goals-header">
                <h1>Your Goals</h1>
                <div className="nav-buttons">
                    <button onClick={() => navigate("/dashboard")} className="btn btn-secondary">Back to Dashboard</button>
                    <button onClick={() => navigate("/prayer-times")} className="btn btn-secondary">Prayer Times</button>
                </div>
            </header>

            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading">Loading...</div>}

            <button onClick={() => { setShowAddForm(true); setEditingGoal(null); }} className="btn btn-primary">
                Add New Goal
            </button>

            {(showAddForm || editingGoal) && (
                <div className="modal-overlay">
                    <div className="goal-form">
                        <h2>{editingGoal ? "Edit Goal" : "Add New Goal"}</h2>
                        <form onSubmit={editingGoal ? handleUpdate : handleSubmit}>
                            <input
                                type="text"
                                name="title"
                                value={goalForm.title}
                                onChange={handleInputChange}
                                placeholder="Goal Title"
                                required
                                disabled={loading}
                            />
                            <textarea
                                name="description"
                                value={goalForm.description}
                                onChange={handleInputChange}
                                placeholder="Description (optional)"
                                disabled={loading}
                            />
                            <input
                                type="date"
                                name="deadline"
                                value={goalForm.deadline}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                            />
                            <input
                                type="number"
                                name="progress"
                                value={goalForm.progress}
                                onChange={handleInputChange}
                                min="0"
                                max="100"
                                placeholder="Progress (%)"
                                disabled={loading}
                            />
                            <label className="checkbox-label">
                                Completed:
                                <input
                                    type="checkbox"
                                    name="completed"
                                    checked={goalForm.completed}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </label>
                            <div className="form-buttons">
                                <button type="submit" className="btn btn-success" disabled={loading}>
                                    {loading ? "Saving..." : editingGoal ? "Update Goal" : "Save Goal"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowAddForm(false); setEditingGoal(null); }}
                                    className="btn btn-secondary"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="goals-list">
                {goals.length === 0 ? (
                    <p className="no-goals">No goals yet. Add one to get started!</p>
                ) : (
                    goals.map((goal) => (
                        <div key={goal.id} className="goal-card">
                            <h3>{goal.title}</h3>
                            {goal.description && <p>{goal.description}</p>}
                            <p>Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${goal.progress}%` }}></div>
                            </div>
                            <p>Progress: {goal.progress}%</p>
                            <p>Status: {goal.completed ? "Completed" : "In Progress"}</p>
                            <div className="goal-actions">
                                <button onClick={() => handleEdit(goal)} className="btn btn-info">Edit</button>
                                <button onClick={() => handleDelete(goal.id)} className="btn btn-danger">Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Goals;