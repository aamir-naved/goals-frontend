import { Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Dashboard from "./routes/Dashboard";
import Goals from "./routes/Goals";
import ProtectedRoute from "./components/ProtectedRoute";
import PrayerTimes from "./routes/PrayerTimes";
import Chatbot from "./routes/Chatbot.jsx";
import "./axiosConfig.js";
import ReportIssue from "./routes/ReportIssue.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/prayer-times" element={<PrayerTimes />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/report-issue" element={<ReportIssue />} /> 

      {/* Protect Dashboard and Goals Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
