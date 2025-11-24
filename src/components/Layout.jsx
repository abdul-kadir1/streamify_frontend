


import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import HomePage from "../pages/HomePage";
import NotificationsPage from "../pages/NotificationsPage";
// import GlobalChat from "../components/GlobalChat";

const LayoutWithPanels = () => {
  const [currentPanel, setCurrentPanel] = useState("home");

  let panelContent;
  if (currentPanel === "home") panelContent = <HomePage />;
  else if (currentPanel === "notifications") panelContent = <NotificationsPage />;
  else if (currentPanel === "groupchat") panelContent = <GlobalChat />;
  else panelContent = <HomePage />;  // fallback

  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar currentPanel={currentPanel} setCurrentPanel={setCurrentPanel} />
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <main className="flex-1 overflow-y-auto">{panelContent}</main>
          {/* < GlobalChat /> */}
        </div>
      </div>
     
    </div>
  );
};

export default LayoutWithPanels;
