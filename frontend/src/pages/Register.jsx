import React, { useContext, useState } from "react";
import "../pages/css/Login.css";
import { Link, useNavigate } from "react-router-dom";
import pic from "../assets/pic1.png";
import axios from "../config/axios";
import { UserContext } from "../context/UserContext";
import Loader from "../components/Loading";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const { setData } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const validateInput = () => {
    const { username, password, bio } = formData;

    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return false;
    }

    if (bio.trim().length > 50) {
      toast.error("User bio must be under 50 characters.");
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 6 characters and include uppercase, lowercase, and a number."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInput()) return;

    const form = new FormData();
    form.append("username", formData.username);
    form.append("email", formData.email);
    form.append("password", formData.password);
    form.append("bio", formData.bio);
    form.append(
      "image",
      formData.image ||
        "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
    );

    setLoading(true);

    try {
      const res = await axios.post("/auth/register", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      localStorage.setItem("token", res.data.token);
      setData(res.data);
      navigate("/");
    } catch (error) {
      toast.error("Something went wrong during registration!");
      console.error("Registration error:", error.message);
    } finally {
      setLoading(false);
      setFormData({
        username: "",
        email: "",
        password: "",
        bio: "",
        image: null,
      });
    }
  };

  return (
    <section className="container">
      {loading && <Loader />}
      <div className="login-container">
        <div className="circle circle-one"></div>
        <div className="form-container">
          <img src={pic} alt="illustration" className="illustration-register" />
          <h1 className="opacity">REGISTER</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="USERNAME"
              name="username"
              onChange={handleChange}
              value={formData.username}
              required
            />
            <input
              type="email"
              placeholder="EMAIL"
              name="email"
              onChange={handleChange}
              value={formData.email}
              required
            />
            <input
              type="password"
              placeholder="PASSWORD"
              name="password"
              onChange={handleChange}
              value={formData.password}
              required
            />
            <input
              type="text"
              placeholder="Enter Your Bio"
              name="bio"
              onChange={handleChange}
              value={formData.bio}
              required
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
            <button className="opacity">REGISTER</button>
          </form>
          <div className="register-forget opacity">
            <Link to="/login">LOGIN</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
