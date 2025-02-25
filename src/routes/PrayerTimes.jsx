import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PrayerTimes.css";

function PrayerTimes() {
    const [location, setLocation] = useState("");
    const [prayerTimes, setPrayerTimes] = useState({});
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const navigate = useNavigate();

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setLatitude(lat);
                    setLongitude(lon);
                    setLocation(`📍 Latitude: ${lat}, Longitude: ${lon}`);
                },
                () => {
                    alert("Location access denied! Please allow location access.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const fetchPrayerTimes = async () => {
        if (latitude === null || longitude === null) {
            alert("Please fetch your location first!");
            return;
        }

        try {
            const response = await fetch(
                `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=1`
            );
            const data = await response.json();
            setPrayerTimes(data.data.timings);
        } catch (error) {
            console.error("Error fetching prayer times:", error);
        }
    };

    return (
        <div className="prayer-container">
            <h2>Prayer Times | Fiqh - Hanafi</h2>

            <div className="button-group">
                <button className="button fetch-location" onClick={getLocation}>
                    📍 Fetch My Location
                </button>
                <button className="button fetch-prayer-times" onClick={fetchPrayerTimes}>
                    🕌 Show Me Prayer Times
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
