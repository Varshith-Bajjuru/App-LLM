import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SidebarContext } from "./context/SidebarContext";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Register from "./components/Register";
import { AuthContext } from "./context/AuthContext";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Home from "./components/home/Home";
import { debounce } from "lodash";

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    saving: false,
    deleting: false,
    loadingChat: false,
    creatingChat: false,
  });
  const [error, setError] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isNewChat, setIsNewChat] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const messagesEndRef = useRef(null);
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);
  const { user } = useContext(AuthContext);
  const maxMessagesPerSession = 1000;
  const isInitialMount = useRef(true);
  const [wsReconnectAttempts, setWsReconnectAttempts] = useState(0);
  const wsRef = useRef(null);

  const debouncedUpdateSessions = useRef(
    debounce((newSessions) => {
      setChatSessions(newSessions);
    }, 300)
  ).current;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setChatSessions([]);
      return;
    }

    const fetchChatHistory = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/history", {
          credentials: "include",
        });
        const data = await response.json();

        if (Array.isArray(data)) {
          const history = data.map((chat) => ({
            id: chat._id || chat.timestamp,
            messages: chat.messages || [
              { text: chat.prompt, isUser: true, timestamp: chat.timestamp },
              { text: chat.response, isUser: false, timestamp: chat.timestamp },
            ],
            timestamp: chat.timestamp,
            title: chat.title || chat.prompt?.slice(0, 30) || "New Chat",
          }));
          setChatSessions(history);
        } else {
          console.error("Fetched data is not an array:", data);
          setChatSessions([]);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setChatSessions([]);
      }
    };

    fetchChatHistory();

    const setupWebSocket = () => {
      const ws = new WebSocket(`ws://localhost:5000/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnectionError(false);
        setWsReconnectAttempts(0);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "CHAT_UPDATE") {
            if (message.data.action === "SAVE") {
              if (message.data.chat.id !== activeSessionId) {
                debouncedUpdateSessions((prev) => {
                  if (message.data.chat.messages.length === 0) return prev;
                  const exists = prev.some(
                    (c) => c.id === message.data.chat.id
                  );
                  return exists
                    ? prev.map((c) =>
                        c.id === message.data.chat.id ? message.data.chat : c
                      )
                    : [message.data.chat, ...prev].filter(
                        (s) => s.messages.length > 0
                      );
                });
              }
            } else if (message.data.action === "DELETE") {
              debouncedUpdateSessions((prev) =>
                prev.filter((c) => c.id !== message.data.id)
              );
            }
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError(true);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnectionError(true);

        const delay = Math.min(1000 * Math.pow(2, wsReconnectAttempts), 30000);
        setTimeout(() => {
          setWsReconnectAttempts((prev) => prev + 1);
          connectWebSocket();
        }, delay);
      };
    };

    setupWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      debouncedUpdateSessions.cancel();
    };
  }, [user, activeSessionId, debouncedUpdateSessions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!prompt.trim()) return;

    if (messages.length >= maxMessagesPerSession * 2) {
      alert("Chat limit reached. Please start a new chat.");
      return;
    }

    const userMessage = {
      text: prompt,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setPrompt("");
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response format from API");
      }

      const botReply = data.candidates[0].content.parts[0].text;
      const botMessage = {
        text: botReply,
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      setLoadingStates((prev) => ({ ...prev, saving: true }));


      const saveResponse = await fetch("http://localhost:5000/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage.text,
          response: botReply,
          sessionId: activeSessionId || null,
        }),
        credentials: "include",
      });

      const saveData = await saveResponse.json();

      if (saveData.isNew) {
        setActiveSessionId(saveData.sessionId);
        setIsNewChat(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) =>
        prev.filter((m) => m.timestamp !== userMessage.timestamp)
      );
      setError({
        message: "Failed to send message",
        details: error.message,
        retry: () => handleSubmit(e),
      });
    } finally {
      setIsLoading(false);
      setLoadingStates((prev) => ({ ...prev, saving: false }));
    }
  };

  const groupChatSessionsByDate = useCallback((sessions) => {
    const sessionsArray = Array.isArray(sessions) ? sessions : [];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastFiveDays = new Date(today);
    lastFiveDays.setDate(today.getDate() - 5);

    const groupedSessions = {
      Today: [],
      Yesterday: [],
      "Last 5 Days": [],
      Previous: [],
    };

    const sortedSessions = [...sessionsArray].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    sortedSessions.forEach((session) => {
      const sessionDate = new Date(session.timestamp);
      if (sessionDate.toDateString() === today.toDateString()) {
        groupedSessions.Today.push(session);
      } else if (sessionDate.toDateString() === yesterday.toDateString()) {
        groupedSessions.Yesterday.push(session);
      } else if (sessionDate > lastFiveDays) {
        groupedSessions["Last 5 Days"].push(session);
      } else {
        groupedSessions.Previous.push(session);
      }
    });

    return groupedSessions;
  }, []);

  const handleNewChat = () => {
    if (messages.length > 0) {
      const newSession = {
        id: Date.now().toString(),
        messages: [...messages],
        timestamp: new Date().toISOString(),
        title: messages[0]?.text?.slice(0, 30) || "New Chat",
      };
      setChatSessions((prev) => [newSession, ...prev]);
    }
    setMessages([]);
    setActiveSessionId(null);
    setIsNewChat(true);
  };

  const handleLoadChat = (session) => {
    if (session.messages.length >= maxMessagesPerSession * 2) {
      alert(
        "This chat session has reached the maximum message limit. Please start a new chat."
      );
      return;
    }
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setIsNewChat(false);
  };
  const handleDeleteChat = async (index, category) => {
    const groupedSessions = groupChatSessionsByDate(chatSessions);
  
    // Check if category exists in groupedSessions
    if (!groupedSessions[category] || !groupedSessions[category][index]) {
      console.error("Invalid category or index");
      return;
    }
  
    const sessionToDelete = groupedSessions[category][index];
  
    // Update UI by removing the deleted session
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
  
    // If the active session is deleted, clear messages and set active session to null
    if (activeSessionId === sessionToDelete.id) {
      setMessages([]);
      setActiveSessionId(null);
    }
  
    setLoadingStates((prev) => ({ ...prev, deleting: true }));
  
    try {
      const response = await fetch("http://localhost:5000/api/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionToDelete.id,
        }),
        credentials: "include",
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        setChatSessions((prev) =>
          [...prev, sessionToDelete].sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          )
        );
  
        throw new Error(data.message || "Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
  
      setError({
        message: "Failed to delete chat",
        details: error.message,
        retry: async () => {
          const maxRetries = 3; // Set a retry limit if needed
          let retries = 0;
  
          while (retries < maxRetries) {
            retries++;
            try {
              await handleDeleteChat(index, category);
              return; // If successful, break out of the loop
            } catch (err) {
              console.log(`Retry attempt ${retries} failed`);
            }
          }
          setError((prev) => ({
            ...prev,
            message: "Max retry attempts reached. Please try again later.",
          }));
        },
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, deleting: false }));
    }
};

  
  const groupedSessions = groupChatSessionsByDate(chatSessions);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            user ? (
              <div className="flex flex-col h-full min-h-screen bg-gray-900 text-white">
                <Sidebar
                  onNewChat={handleNewChat}
                  chatSessions={groupedSessions}
                  handleLoadChat={handleLoadChat}
                  handleDeleteChat={handleDeleteChat}
                  loadingStates={loadingStates}
                  activeSessionId={activeSessionId}
                  isNewChat={isNewChat && messages.length === 0}
                />

                <div className="flex-1 flex flex-col">
                  <header className="sticky top-0 z-10 flex items-center justify-center text-xl font-bold py-4 bg-gray-800 shadow-md">
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="absolute left-4 text-white focus:outline-none"
                    >
                      ☰
                    </button>
                    Chat App
                    {connectionError && (
                      <span className="text-xs text-yellow-400 ml-2">
                        (Connection issues)
                      </span>
                    )}
                  </header>

                  {error && (
                    <div className="fixed bottom-4 right-4 bg-red-800 p-3 rounded-lg shadow-lg max-w-md z-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{error.message}</h3>
                          <p className="text-sm">{error.details}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={error.retry}
                            className="px-2 py-1 bg-red-700 rounded hover:bg-red-600"
                          >
                            Retry
                          </button>
                          <button
                            onClick={() => setError(null)}
                            className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-4">
                      {messages.length === 0 && !isLoading ? (
                        <div className="text-center text-gray-400 py-10">
                          Start a new conversation
                        </div>
                      ) : (
                        messages.map((message, i) => (
                          <div
                            key={`${message.timestamp}-${i}`}
                            className={`mb-4 ${message.isUser ? "text-right" : "text-left"}`}
                          >
                            <div
                              className={`inline-block p-3 rounded-lg max-w-3xl transition duration-300 shadow-md ${
                                message.isUser
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-700 text-gray-200"
                              }`}
                            >
                              <div className="whitespace-pre-wrap">
                                {message.text}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(
                                  message.timestamp
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="p-3 my-2 rounded-lg max-w-3xl bg-gray-700 text-gray-200">
                          Typing...
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-gray-800 p-4 border-t border-gray-700">
                    <form
                      onSubmit={handleSubmit}
                      className="flex gap-3 max-w-4xl mx-auto"
                    >
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-2 bg-gray-700 text-white rounded-md outline-none focus:ring focus:ring-blue-500"
                        disabled={isLoading || loadingStates.saving}
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition disabled:opacity-50"
                        disabled={isLoading || loadingStates.saving}
                      >
                        {loadingStates.saving ? "Saving..." : "Send"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <Home />
            )
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
