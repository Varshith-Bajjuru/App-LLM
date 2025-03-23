import React, { useState, createContext, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Function to check if the user is authenticated
  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/check", {
        credentials: "include", // Include cookies in the request
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
    }
  };

  // Check authentication on initial load
  useEffect(() => {
    checkAuth();
  }, []);

  // Function to log out the user
  const logout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
