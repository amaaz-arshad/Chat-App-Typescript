// @ts-nocheck
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AuthProvider from "./context/auth";
import PrivateRoute from "./components/PrivateRoute";
import { useEffect } from "react";
import KeyboardShortcuts from "./components/KeyboardShortcuts";

const App: React.FC = () => {
  KeyboardShortcuts();

  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route exact path="register" element={<Register />} />
        <Route exact path="login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route exact path="profile" element={<Profile />} />
          <Route exact path="/" element={<Home />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
