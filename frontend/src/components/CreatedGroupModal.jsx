
// import React, { useState, useEffect } from "react";
// import axios from "../config/axios";

// const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
//   const [groupName, setGroupName] = useState("");
//   const [friends, setFriends] = useState([]);
//   const [selectedFriends, setSelectedFriends] = useState([]);
//   const [groupImage, setGroupImage] = useState(null); // 👈 Just store file

//   useEffect(() => {
//     axios
//       .get("/user/friends")
//       .then((res) => {
//         setFriends(res.data.friendDetails);
//       })
//       .catch((error) => {
//         console.log(error.message);
//       });

    
//   }, []);

//   const toggleFriend = (id) => {
//     setSelectedFriends((prev) =>
//       prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
//     );
//   };

//   const handleCreateGroup = async () => {
//     if (!groupName) {
//       return alert("Group name is required");
//     }

//     if (selectedFriends.length < 2) {
//       return alert(
//         "Select at least 2 members to create a group (excluding you)"
//       );
//     }

//     try {
//       const formData = new FormData();
//       formData.append("groupname", groupName);

//       formData.append("member", JSON.stringify(selectedFriends));

//       if (groupImage) {
//         formData.append("image", groupImage);
//       }

//       await axios.post("/groups/create-group", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });



//       onGroupCreated();
//       onClose();

//       setGroupName("");
//       setSelectedFriends([]);
//       setGroupImage(null);
//     } catch (error) {
//       console.error("Error creating group:", error.message);
//     }
//   };

//   const handleImageChange = (e) => {
//     setGroupImage(e.target.files[0]);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="modal" onClick={onClose}>
//       <div className="modal-wrap" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-content">
//           <button className="close-btn" onClick={onClose}>
//             X
//           </button>

//           <h3>Create New Group</h3>

//           <input
//             type="text"
//             placeholder="Enter group name"
//             value={groupName}
//             onChange={(e) => setGroupName(e.target.value)}
//             className="group-input"
//             required
//           />

//           {/* 👇 Image Upload Field */}
//           <div className="image-upload" style={{ paddingBottom: "10px" }}>
//             <label htmlFor="groupImage">Upload Group Image:</label>
//             <input
//               type="file"
//               id="groupImage"
//               name="image"
//               accept="image/*"
//               onChange={handleImageChange}
//             />
//           </div>

//           <div className="friends-list">
//             {friends.map((friend) => (
//               <div
//                 key={friend._id}
//                 onClick={() => toggleFriend(friend._id)}
//                 className={`friend-item ${
//                   selectedFriends.includes(friend._id) ? "selected" : ""
//                 }`}
//               >
//                 <span>{friend.username}</span>
//                 <span>
//                   {selectedFriends.includes(friend._id) ? "✅" : "➕"}
//                 </span>
//               </div>
//             ))}
//           </div>

//           <button onClick={handleCreateGroup} className="create-btn">
//             Create Group
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateGroupModal;


import React, { useState, useEffect } from "react";
import axios from "../config/axios";
import Loader from "../components/Loading";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupImage, setGroupImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/user/friends");
        setFriends(res.data.friendDetails);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load friends");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const toggleFriend = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName) {
      return toast.warn("Group name is required");
    }

    if (selectedFriends.length < 2) {
      return toast.warn("Select at least 2 members to create a group");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("groupname", groupName);
      formData.append("member", JSON.stringify(selectedFriends));
      if (groupImage) {
        formData.append("image", groupImage);
      }

      await axios.post("/groups/create-group", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Group created successfully");
      onGroupCreated();
      onClose();

      setGroupName("");
      setSelectedFriends([]);
      setGroupImage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    setGroupImage(e.target.files[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-wrap" onClick={(e) => e.stopPropagation()}>
        {loading && <Loader />}

        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>X</button>

          <h3>Create New Group</h3>

          <input
            type="text"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="group-input"
            required
          />

          <div className="image-upload" style={{ paddingBottom: "10px" }}>
            <label htmlFor="groupImage">Upload Group Image:</label>
            <input
              type="file"
              id="groupImage"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="friends-list">
            {friends.map((friend) => (
              <div
                key={friend._id}
                onClick={() => toggleFriend(friend._id)}
                className={`friend-item ${
                  selectedFriends.includes(friend._id) ? "selected" : ""
                }`}
              >
                <span>{friend.username}</span>
                <span>{selectedFriends.includes(friend._id) ? "✅" : "➕"}</span>
              </div>
            ))}
          </div>

          <button onClick={handleCreateGroup} className="create-btn">
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
