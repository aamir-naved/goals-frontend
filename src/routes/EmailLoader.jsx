import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const EmailLoader = () => {
    const [status, setStatus] = useState("Sending");

    useEffect(() => {
        const interval = setInterval(() => {
            setStatus((prev) =>
                prev === "Sending..." ? "Sending" : prev + "."
            );
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            {/* Animated Paper Plane */}
            <motion.div
                animate={{ x: [0, 30, 0], y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-5xl"
            >
                ✈️
            </motion.div>

            {/* Sending Text Animation */}
            <p className="text-lg font-semibold mt-2">{status}</p>
        </div>
    );
};

export default EmailLoader;
