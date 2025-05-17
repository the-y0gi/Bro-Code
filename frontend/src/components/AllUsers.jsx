import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import "../pages/css/AllUser.css";
import Loader from "../components/Loading"; // Loader component to show while loading
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AllUsers = () => {
  const [allUserData, setAllUserData] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to send or cancel friend request
  const handleClick = async (id) => {
    setLoading(true); // Show loader during API call

    if (sentRequests.includes(id)) {
      // Cancel request
      try {
        await axios.post("/request/cancel-request", { receiverId: id });
        setSentRequests((prev) => prev.filter((reqId) => reqId !== id));
        toast.success("Request canceled successfully");
      } catch (error) {
        toast.error("Error canceling request");
      } finally {
        setLoading(false);
      }
    } else {
      // Send request
      try {
        await axios.post("/request/send-request", { receiverId: id });
        setSentRequests((prev) => [...prev, id]);
        toast.success("Request sent successfully");
      } catch (error) {
        toast.error("Error sending request");
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch all users on component mount
  useEffect(() => {
    setLoading(true);
    axios
      .get("/user/all-users")
      .then((res) => {
        setAllUserData(res.data);
      })
      .catch(() => {
        toast.error("Error fetching users");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="all-users">
      {loading && <Loader />} 
      <div className="all-user-headline">
        <h1>All Friends...</h1>
      </div>
      <div className="users-container">
        {allUserData.map((item) => (
          <div className="user-profile" key={item._id}>
            <div className="user-img">
              <img
                src={
                  item.image ||
                  "https://images.pexels.com/photos/31167823/pexels-photo-31167823/free-photo-of-young-man-sitting-in-sunlit-forest-clearing.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                }
                alt={item.username}
              />
            </div>
            <h2>{item.username}</h2>
            <p>{item.bio || "I am a new user"}</p>
            <button
              onClick={() => handleClick(item._id)}
              style={
                sentRequests.includes(item._id)
                  ? { backgroundColor: "#a54834" }
                  : {}
              }
            >
              {sentRequests.includes(item._id)
                ? "Cancel Request"
                : "Send Request"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;
