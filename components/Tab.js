import React, { useState } from "react";

const Tab = ({ label, activeTab, onClick }) => {
    return (
      <div
        className={`tab ${activeTab === label ? "active-tab" : ""}`}
        onClick={() => onClick(label)}
      >
        {label}
      </div>
    );
  };
  

export default Tab;