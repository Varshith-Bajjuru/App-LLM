import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to Chat App</h1>
      <p className="text-lg mb-8">
        Please login or register to start chatting.
      </p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md transition font-bold text-sm"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md transition font-bold text-sm"
        >
          Register
        </Link>
      </div>
    </div>
  );
}

export default Home;
