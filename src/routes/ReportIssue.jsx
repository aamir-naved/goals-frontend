import { useState } from "react";
import axios from "axios";
import EmailLoader from "./EmailLoader";
import { useNavigate } from "react-router-dom";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Replace with actual backend URL

const ReportIssue = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);


    const [alertMessage, setAlertMessage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertMessage(null);
        setLoading(true)

        try {
            console.log("hitting url...")
            const response = await axios.post(`${API_BASE_URL}/report-issue/sendEmail`, formData, {
                headers: { "Content-Type": "application/json" }
            });
            console.log(response)
            setAlertMessage({ type: "success", text: "Issue reported successfully!" });
            setFormData({ name: "", email: "", subject: "", message: "" }); // Reset form
        } catch (error) {
            setAlertMessage({ type: "error", text: "Failed to report issue. Please try again." });
            console.log("Error..")
            console.log(error)
        } finally {
            setLoading(false);  // Hide loader
        }
    };

    return (
        <div>
        
            <h2>Report an Issue</h2>
            <button
                onClick={() => navigate("/dashboard")}
                className="add-goal-btn"
            >
                Back to Dashboard
            </button>
            
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
                <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} required />
                <textarea
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    style={{
                        width: "100%",      // Make it full width
                        height: "150px",     // Increase height
                        padding: "10px",     // Add padding for better spacing
                        fontSize: "16px",    // Improve readability
                        borderRadius: "5px", // Slightly rounded corners
                        border: "1px solid #ccc" // Light gray border
                    }}
                />
                {loading ? <EmailLoader /> : <button type="submit">Submit</button>}
                {alertMessage && (
                    <p style={{ color: alertMessage.type === "success" ? "green" : "red" }}>
                        {alertMessage.text}
                    </p>

                )}
            </form>
        </div>
    );
};

export default ReportIssue;
