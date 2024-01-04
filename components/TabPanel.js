import React, { useState } from "react";

const TabPanel = ({ title, activeTab, children }) => {
    return (
      <div className={`tab-panel ${activeTab === title ? 'active' : ''}`}>
        {children}
      </div>
    );
  };
  
  export default TabPanel;