import React from "react";
import "../pages/css/Loader.css"; // CSS file with your styles

const Loader = () => {
  return (
    <div className="loader-overlay">
      <span className="loader"></span>
    </div>
  );
};

export default Loader;
