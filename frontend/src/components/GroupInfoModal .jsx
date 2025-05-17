import "../pages/css/GroupInfoModal.css";
import React, { useRef, useEffect, useState } from "react";
import AddMemberModal from "./AddMemberModal";
import axiosInstance from "../config/axios";
import Loader from "../components/Loading";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GroupInfoModal = ({
  groupMembers = [],
  onClose,
  onRemoveMember,
  onExitGroup,
  onAddMember,
  currentAdminId,
  setGroupsShouldRefresh,
  currentUserId,
  selectedChatId,
}) => {
  const modalRef = useRef();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = currentAdminId?._id === currentUserId?._id;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !showAddMemberModal &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, showAddMemberModal]);

  const handleOpenAddMember = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/user/friends");
      const available = data.friendDetails.filter(
        (user) => !groupMembers.some((member) => member._id === user._id)
      );
      setAvailableUsers(available);
      setShowAddMemberModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUserToAdd = async (user) => {
    setLoading(true);
    try {
      await axiosInstance.put(`/groups/add-member/${selectedChatId}`, {
        members: [user._id],
      });
      toast.success("User added successfully");
      onAddMember(user);
      setShowAddMemberModal(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add member"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExitGroup = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(
        "/groups/exit",
        { groupID: selectedChatId },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success("You exited the group");
      onExitGroup(selectedChatId);
      setGroupsShouldRefresh(true);
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to exit group"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group-info-modal">
      {loading && <Loader />}
      <div className="modal-content" ref={modalRef}>
        <button onClick={onClose} className="close-btn">X</button>
        <h3>Group Info</h3>

        <div className="group-members">
          {groupMembers.map((member, index) => (
            <div key={index} className="group-member">
              <img
                src={
                  member.image ||
                  "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
                }
                alt={member.username}
                className="member-dp"
              />
              <span>{member.username}</span>

              {currentAdminId?._id === member?._id && <span> (Admin)</span>}

              {isAdmin && (
                currentAdminId._id === member._id ? (
                  <button
                    onClick={() => onRemoveMember("delete-group")}
                    className="remove-member delete-group-btn"
                  >
                    Delete Group
                  </button>
                ) : (
                  <button
                    onClick={() => onRemoveMember(member._id)}
                    className="remove-member"
                  >
                    Remove
                  </button>
                )
              )}

              {currentUserId?._id === member?._id && !isAdmin && (
                <button
                  onClick={handleExitGroup}
                  className="exit-group-btn"
                >
                  Exit Group
                </button>
              )}
            </div>
          ))}
        </div>

        {isAdmin && (
          <button className="add-member-btn" onClick={handleOpenAddMember}>
            Add New Member
          </button>
        )}
      </div>

      {showAddMemberModal && (
        <AddMemberModal
          availableUsers={availableUsers}
          onClose={() => setShowAddMemberModal(false)}
          onSelectUser={handleSelectUserToAdd}
        />
      )}
    </div>
  );
};

export default GroupInfoModal;
