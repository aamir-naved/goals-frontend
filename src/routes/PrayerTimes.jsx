import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PrayerTimes.css";

function PrayerTimes() {
    const [location, setLocation] = useState("");
    const [prayerTimes, setPrayerTimes] = useState({});
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const getLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setLatitude(lat);
                    setLongitude(lon);
                    setLocation(`📍 Latitude: ${lat}, Longitude: ${lon}`);
                    setLoading(false);
                },
                () => {
                    alert("Location access denied! Please allow location access.");
                    setLoading(false);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    const fetchPrayerTimes = async () => {
        if (latitude === null || longitude === null) {
            alert("Please fetch your location first!");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=1`
            );
            const data = await response.json();
            setPrayerTimes(data.data.timings);
        } catch (error) {
            console.error("Error fetching prayer times:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="prayer-container">
            <h2>Prayer Times | Fiqh - Hanafi</h2>

            <div className="button-group">
                <button className="button fetch-location" onClick={getLocation} disabled={loading}>
                    {loading ? <span className="loader"></span> : "📍 Fetch My Location"}
                </button>
                <button className="button fetch-prayer-times" onClick={fetchPrayerTimes} disabled={loading}>
                    {loading ? <span className="loader"></span> : "🕌 Show Me Prayer Times"}
                </button>
            </div>

            <p className="location-text">{location}</p>

            {Object.keys(prayerTimes).length > 0 && (
                <div className="prayer-times-box">
                    <h3>Prayer Times</h3>
                    {Object.entries(prayerTimes).map(([prayer, time]) => (
                        <p key={prayer}>
                            <strong>{prayer}:</strong> {time}
                        </p>
                    ))}
                </div>
            )}

            {/* Back to Home Button */}
            <div className="back-home">
                <button className="button back-button" onClick={() => navigate("/")}>
                    🔙 Back to Home
                </button>
            </div>
        </div>
    );
}

export default PrayerTimes;
