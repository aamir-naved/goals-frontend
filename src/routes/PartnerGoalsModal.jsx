import React from "react";
import "./PartnerGoalsModal.css"; // Separate CSS for this modal
import Loader from "./Loader"; // Import Loader if used

const PartnerGoalsModal = ({isOpen, onClose, partnerGoals, loading }) => {
    if (!isOpen) return null; // Don't render if modal is not open

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Partner's Goals</h2>
                <button className="close-modal" onClick={onClose}>Close</button>
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
    );
};

export default PartnerGoalsModal;
