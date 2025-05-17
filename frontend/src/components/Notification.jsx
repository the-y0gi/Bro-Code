

// import React, { useEffect, useState } from "react";
// import "../pages/css/Other.css";
// import "../pages/css/NotificationBar.css";
// import axios from "../config/axios";
// import { ToastContainer, toast } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';

// const Notification = () => {
//   const [allUserData, setAllUserData] = useState([]);
//   const [requestedUser, setRequestedUser] = useState([]);
//   const [popup, setPopup] = useState(null);

//   const fetchAllUsers = async () => {
//     try {
//       const res = await axios.get("/user/all-users");
//       setAllUserData(res.data);
//     } catch (error) {
//       toast.error("Failed to fetch all users!");
//       console.log(error.message);
//     }
//   };

//   const fetchRequestedUsers = async () => {
//     try {
//       const res = await axios.get("/request/show-request");
//       setRequestedUser(res.data.requests);
//     } catch (error) {
//       toast.error("Failed to fetch requests!");
//       console.log(error.message);
//     }
//   };

//   const handleAcceptRequest = async (id) => {
//     try {
//       await axios.post("/request/accept-request", { requestId: id });
//       setPopup("Request Accepted ✅");
//       toast.success("Request accepted!");

//       fetchRequestedUsers();
//       fetchAllUsers();
//     } catch (error) {
//       toast.error("Error accepting request!");
//       console.log(error);
//     }
//   };

//   const handleRejectRequest = async (id) => {
//     try {
//       await axios.post("/request/reject-request", { requestId: id });
//       setPopup("Request Rejected ❌");
//       toast.info("Request rejected!");

//       fetchRequestedUsers();
//       fetchAllUsers();
//     } catch (error) {
//       toast.error("Error rejecting request!");
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     fetchAllUsers();
//     fetchRequestedUsers();
//   }, []);

//   useEffect(() => {
//     if (popup) {
//       const timer = setTimeout(() => {
//         setPopup(null);
//       }, 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [popup]);

//   return (
//     <div className="notification">
//       <ToastContainer position="top-right" autoClose={3000} />

//       <div className="header-notification">
//         <h2>Your Notification...</h2>
//       </div>

//       {popup && <div className="popup-message">{popup}</div>}

//       <div className="notification-wrapper">
//         <div className="user-status-section">
//           <h3>Your Sending Status</h3>
//           {allUserData
//             .filter((item) =>
//               ["pending", "rejected", "accepted"].includes(item.requestStatus)
//             )
//             .map((item, i) => (
//               <div className="status-bar" key={i}>
//                 <div className="status-img">
//                   <img
//                     src={item.image || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
//                     alt=""
//                   />
//                 </div>
//                 <div className="user-name">
//                   <p>{item.username}</p>
//                 </div>
//                 <div className={`status-mode ${item.requestStatus}`}>
//                   <p>{item.requestStatus}</p>
//                 </div>
//               </div>
//             ))}
//         </div>

//         <div className="requested-user-section">
//           <h3>Requested User</h3>
//           {requestedUser.map((item, i) => (
//             <div className="status-bar" key={i}>
//               <div className="status-img">
//                 <img
//                   src={item.image || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
//                   alt=""
//                 />
//               </div>
//               <div className="user-name">
//                 <p>{item.sender.username}</p>
//               </div>
//               <div className="req-status-mode">
//                 <button
//                   style={{ backgroundColor: "green", border: "none" }}
//                   onClick={() => handleAcceptRequest(item._id)}
//                 >
//                   <i className="ri-check-fill"></i>
//                 </button>
//                 <button
//                   style={{ backgroundColor: "red", border: "none" }}
//                   onClick={() => handleRejectRequest(item._id)}
//                 >
//                   <i className="ri-close-circle-fill"></i>
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Notification;

import React, { useEffect, useState } from "react";
import "../pages/css/Other.css";
import "../pages/css/NotificationBar.css";
import axios from "../config/axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Notification = () => {
  const [allUserData, setAllUserData] = useState([]);
  const [requestedUser, setRequestedUser] = useState([]);

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get("/user/all-users");
      setAllUserData(res.data);
    } catch (error) {
      toast.error("Failed to fetch all users!");
      console.log(error.message);
    }
  };

  const fetchRequestedUsers = async () => {
    try {
      const res = await axios.get("/request/show-request");
      setRequestedUser(res.data.requests);
    } catch (error) {
      toast.error("Failed to fetch requests!");
      console.log(error.message);
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      await axios.post("/request/accept-request", { requestId: id });
      toast.success("Request accepted!");

      fetchRequestedUsers();
      fetchAllUsers();
    } catch (error) {
      toast.error("Error accepting request!");
      console.log(error);
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await axios.post("/request/reject-request", { requestId: id });
      toast.info("Request rejected!");

      fetchRequestedUsers();
      fetchAllUsers();
    } catch (error) {
      toast.error("Error rejecting request!");
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchRequestedUsers();
  }, []);

  return (
    <div className="notification">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="header-notification">
        <h2>Your Notification...</h2>
      </div>

      <div className="notification-wrapper">
        <div className="user-status-section">
          <h3>Your Sending Status</h3>
          {allUserData
            .filter((item) =>
              ["pending", "rejected", "accepted"].includes(item.requestStatus)
            )
            .map((item, i) => (
              <div className="status-bar" key={i}>
                <div className="status-img">
                  <img
                    src={item.image || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
                    alt=""
                  />
                </div>
                <div className="user-name">
                  <p>{item.username}</p>
                </div>
                <div className={`status-mode ${item.requestStatus}`}>
                  <p>{item.requestStatus}</p>
                </div>
              </div>
            ))}
        </div>

        <div className="requested-user-section">
          <h3>Requested User</h3>
          {requestedUser.map((item, i) => (
            <div className="status-bar" key={i}>
              <div className="status-img">
                <img
                  src={item.image || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
                  alt=""
                />
              </div>
              <div className="user-name">
                <p>{item.sender.username}</p>
              </div>
              <div className="req-status-mode">
                <button
                  style={{ backgroundColor: "green", border: "none" }}
                  onClick={() => handleAcceptRequest(item._id)}
                >
                  <i className="ri-check-fill"></i>
                </button>
                <button
                  style={{ backgroundColor: "red", border: "none" }}
                  onClick={() => handleRejectRequest(item._id)}
                >
                  <i className="ri-close-circle-fill"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;
