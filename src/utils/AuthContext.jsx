import { createContext, useState, useEffect, useContext } from "react";
import { account } from "../appwriteConfig";
import { useNavigate } from "react-router";
import { ID } from "appwrite";

// Create the context
const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUserOnLoad();
  }, []);

  const getUserOnLoad = async () => {
    try {
      let accountDetails = await account.get();
      setUser(accountDetails);
      console.log("User session active:", accountDetails);
    } catch (error) {
      console.error("No active session. Redirecting to login...");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async (e, credentials) => {
    e.preventDefault();
    try {
      // Delete any existing session before creating a new one
      await account.deleteSession("current");

      // Create a new session
      let response = await account.createEmailPasswordSession(
        credentials.email,
        credentials.password
      );
      let accountDetails = await account.get();
      setUser(accountDetails);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid credentials. Please check your email and password.");
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleRegister = async (e, credentials) => {
    e.preventDefault();
    if (credentials.password1 !== credentials.password2) {
      alert("Passwords do not match!");
      return;
    }
    try {
      // Register the user
      let response = await account.create(
        ID.unique(),
        credentials.email,
        credentials.password1,
        credentials.name
      );
      console.log("User registered!", response);

      // Log in the user after registration
      await account.createEmailPasswordSession(
        credentials.email,
        credentials.password1
      );
      let accountDetails = await account.get();
      setUser(accountDetails);
      alert("Registration successful!");
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.message.includes("already exists")) {
        alert("A user with this email already exists.");
      } else {
        alert("Registration failed. Please try again.");
      }
    }
  };

  const contextData = {
    user,
    handleUserLogin,
    handleLogout,
    handleRegister,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? <p>Loading...</p> : children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Default export (optional)
export default AuthContext;
