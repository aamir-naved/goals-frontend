import React from "react";
import "./Loader.css"; // Import the loader's CSS

const Loader = () => {
    return (
        <div className="loader-container">
            <div className="loader"></div>
            <div className="arrow"></div>
        </div>
    );
};

export default Loader;
