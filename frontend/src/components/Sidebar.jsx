import React, { useContext } from "react";
import { SidebarContext } from "../context/SidebarContext";

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);
  return (
    <div
      className={`w-64 bg-gray-800 p-4 transform transition-transform fixed h-full ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <button
        onClick={() => setSidebarOpen(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        ✕
      </button>

      <h2 className="text-lg font-bold mb-4">LLM Performance</h2>
      <div className="text-sm">
        <p>Response Time: 0.5s</p>
        <p>API Usage: 10/1000 requests</p>
      </div>
      <h2 className="text-lg font-bold mt-6">Chat History</h2>
      <ul className="text-sm">
        <li>Chat 1</li>
        <li>Chat 2</li>
        <li>Chat 3</li>
      </ul>
    </div>
  );
};

export default Sidebar;
