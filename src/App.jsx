import { Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Dashboard from "./routes/Dashboard";
import Goals from "./routes/Goals";
import ProtectedRoute from "./components/ProtectedRoute";
import PrayerTimes from "./routes/PrayerTimes";
import "./axiosConfig.js";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/prayer-times" element={<PrayerTimes />} />

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
