import React, { useContext } from "react";
import { SidebarContext } from "../context/SidebarContext";

const Sidebar = ({ onNewChat, chatSessions, setChatSessions, setMessages }) => {
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);
  const maxMessagesPerSession = 20;

  const handleNewChat = () => {
    onNewChat();
  };

  const handleDeleteChat = (index) => {
    const updatedSessions = chatSessions.filter((_, i) => i !== index);
    setChatSessions(updatedSessions);
    localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
  };

  const handleLoadChat = (index) => {
    const selectedSession = chatSessions[index];
    if (selectedSession.length < maxMessagesPerSession) {
      setMessages(selectedSession);
    } else {
      alert(
        "This chat session has reached the maximum message limit. Please start a new chat."
      );
    }
  };

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
        {chatSessions.map((session, index) => (
          <li key={index} className="mb-2 flex justify-between items-center">
            <button
              onClick={() => handleLoadChat(index)}
              className="text-gray-300 hover:text-white"
            >
              Chat Session {index + 1}
            </button>
            <button
              onClick={() => handleDeleteChat(index)}
              className="text-red-500 hover:text-red-700"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={handleNewChat}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-4"
      >
        New Chat
      </button>
    </div>
  );
};

export default Sidebar;
