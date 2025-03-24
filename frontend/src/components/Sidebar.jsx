import React, { useContext } from "react";
import { SidebarContext } from "../context/SidebarContext";

const Sidebar = ({
  onNewChat,
  chatSessions,
  setChatSessions,
  setMessages,
  handleLoadChat,
  handleDeleteChat,
}) => {
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);

  return (
    <div
      className={`w-[260px] bg-gray-800 h-screen flex flex-col transform transition-transform fixed ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="header p-3 flex justify-between items-center border-b border-gray-700">
        <button
          onClick={() => setSidebarOpen(false)}
          className="close-button p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <button
          onClick={onNewChat}
          className="new-chat-button p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <div className="chat-history flex-1 overflow-y-auto p-3">
        {Object.entries(chatSessions).map(([category, sessions]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold mb-2 text-gray-400">
              {category}
            </h3>
            <ul>
              {sessions.map((session, index) => (
                <li
                  key={index}
                  className="chat-item p-2 hover:bg-gray-700 rounded-lg flex justify-between items-center text-gray-300 hover:text-white"
                >
                  <button
                    onClick={() => handleLoadChat(session)}
                    className="flex-1 text-left"
                  >
                    Chat Session {index + 1}
                  </button>
                  <button
                    onClick={() => handleDeleteChat(index, category)} // Use handleDeleteChat
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="upgrade-plan p-3 border-t border-gray-700">
        <button className="upgrade-button p-2 w-full hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white">
          <span>Upgrade Plan</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
