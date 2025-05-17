
import '../pages/css/AddMemberModal.css';

const AddMemberModal = ({ availableUsers, onClose, onSelectUser }) => {

  return (
    <div className="add-member-modal">
      <div className="modal-content">
        <h3>Select a user to add</h3>
        <button className="close-btn" onClick={onClose}>X</button>

        <div className="user-list">
          {availableUsers.length === 0 ? (
            <p>No users available to add.</p>
          ) : (
            availableUsers.map((user) => (
              <div key={user._id} className="user-item" onClick={() => onSelectUser(user)}>
                <img 
                  src={user.image || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"} 
                  alt={user.username} 
                  className="user-dp"
                />
                <span>{user.username}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
