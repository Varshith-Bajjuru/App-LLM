import React, { useState, useEffect, useRef } from "react";

const App = () => {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!prompt.trim()) return;

        const newMessages = [...messages, { text: prompt, isUser: true }];
        setMessages(newMessages);
        setPrompt("");
        const apiKey = import.meta.env.VITE_API_KEY;
        try {
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

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0) {
                const botReply = data.candidates[0].content.parts[0].text;
                setMessages([...newMessages, { text: botReply, isUser: false }]);
            } else {
                console.error("Unexpected API response:", data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <header className="text-center text-xl font-bold py-4 bg-gray-800 shadow-md">
                Chat App
            </header>
            <div className="flex-1 flex items-center justify-center max-h-177">
                <div className="w-full max-w-full h-5/6 overflow-y-auto bg-gray-800 rounded-lg p-6 shadow-md custom-scrollbar">
                    {messages.map((message, i) => (
                        <div
                            key={i}
                            className={`p-3 my-2 rounded-3xl max-w-xl ${
                                message.isUser
                                    ? "bg-blue-500 text-white self-end ml-auto"
                                    : "bg-gray-700 text-gray-200 self-start"
                            }`}
                        >
                            {message.text}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <form
                onSubmit={handleSubmit}
                className="p-3 flex gap-3 bg-gray-800 shadow-lg"
            >
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Type here..."
                    className="flex-1 p-2 bg-gray-700 text-white rounded-md outline-none text-sm"
                />
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition font-bold text-sm"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default App;
