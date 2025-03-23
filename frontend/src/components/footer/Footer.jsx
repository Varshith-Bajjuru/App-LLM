import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="text-center py-4 bg-gray-800 shadow-md mt-auto">
      <p className="text-white">&copy; 2023 Chat App. All rights reserved.</p>
      <Link to="/privacy" className="text-blue-500 hover:text-blue-400">
        Privacy Policy
      </Link>
    </footer>
  );
}

export default Footer;
