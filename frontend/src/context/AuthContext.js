import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Set axios default header
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  useEffect(() => {
    if (token) {
      getUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const getUserProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/profile`
      );
      setUser(response.data.user);
    } catch (error) {
      console.error("Get profile error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        {
          email,
          password,
        }
      );

      const { user, token } = response.data;

      setUser(user);
      setToken(token);
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/register`,
        userData
      );

      const { user, token } = response.data;

      setUser(user);
      setToken(token);
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success("Registration successful!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logged out successfully");
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        userData
      );
      setUser(response.data.user);
      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
