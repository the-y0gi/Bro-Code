import React, { useContext, useState } from "react";
import "../pages/css/Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/UserContext";
import Loader from "../components/Loading";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Login = () => {
  const [isShow, setIsShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { setData } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", res.data.token);
      setData(res.data);
      navigate("/");
    } catch (error) {
      toast.error("Something went wrong! Check your credentials.");
      console.error("Login error:", error.message);
    } finally {
      setLoading(false);
      setFormData({ email: "", password: "" });
    }
  };

  const handlePasswordShow = () => {
    setIsShow(!isShow);
  };

  return (
    <section className="container">
      {loading && <Loader />}
      <div className="login-container">
        <div className="circle circle-one"></div>
        <div className="form-container">
          <img
            src="https://raw.githubusercontent.com/hicodersofficial/glassmorphism-login-form/master/assets/illustration.png"
            alt="illustration"
            className="illustration"
          />
          <h1 className="opacity">LOGIN</h1>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="EMAIL"
              name="email"
              onChange={handleChange}
              value={formData.email}
              required
            />

            <input
              type={isShow ? "text" : "password"}
              placeholder="PASSWORD"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {isShow ? (
              <i className="ri-eye-off-fill" onClick={handlePasswordShow}></i>
            ) : (
              <i className="ri-eye-fill" onClick={handlePasswordShow}></i>
            )}
            <button type="submit" className="opacity">
              Log In
            </button>
          </form>
          <div className="register-forget opacity">
            <Link to="/register">REGISTER</Link>
            <Link to="/forget">FORGOT PASSWORD</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
