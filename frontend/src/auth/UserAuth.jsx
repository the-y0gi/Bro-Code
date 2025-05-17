import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const UserAuth = ({ children }) => {
  const  {data}  = useContext(UserContext);
  const token = localStorage.getItem("token");
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !data) {
      navigate("/login");
    }
  }, [data, token, navigate]);

  if (!token) {
    return <div>You are not authorized</div>;
  }

  return <>{children}</>;
};

export default UserAuth;
