import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Home from "../pages/Home";
import UserAuth from "../auth/UserAuth";
import Notification from "../components/Notification";

import MainChat from "../components/MainChat";
import AllUsers from "../components/AllUsers";
import UserProfile from "../components/UserProfile";
import ForgetPassword from "../pages/ForgetPassword";
import NetworkStatus from "../components/NetworkStatus ";

const AppRouter = () => {
  return (
    <div>
      <BrowserRouter>
      <NetworkStatus/>
        <Routes>
          <Route
            path="/"
            element={
              <UserAuth>
                <Home />
              </UserAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forget" element={<ForgetPassword/>} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/chat" element={<MainChat />} />
          <Route path="/profile" element={<UserProfile/>} />
          <Route path="/notification" element={<Notification />} />
        
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default AppRouter;
