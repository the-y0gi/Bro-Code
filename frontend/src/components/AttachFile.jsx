
import React, { useRef, useState, useEffect } from "react";
import axiosInstance from "../config/axios";
import { sendMediaMessage } from "../utilities/sendMediaMessage";
import "../pages/css/AttachedFile.css"

const AttachFileModal = ({
  onClose,
  onFileSelect,
  fileType,
  currentUser,
  selectedUserId,
  selectedGroupId,
}) => {
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);  // Reference to the modal container
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [fileSizeError, setFileSizeError] = useState(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleAfterUpload = async (secureUrl, messageType) => {
    try {
      await sendMediaMessage({
        senderId: currentUser?.user._id,
        receiverId: selectedUserId?.id,
        groupId: selectedGroupId,
        url: secureUrl,
        messageType,
      });
    } catch (err) {
      console.error("Failed to send media message", err);
    }
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post("/media/upload-file", formData);
      const result = res.data;

      if (res.status !== 200 || !result.success) {
        throw new Error(result.message || "File upload failed.");
      }

      onFileSelect(result);

      setIsUploading(false);
      onClose();  // Close the modal after successful upload
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("File upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileSizeError("File size exceeds the 10MB limit.");
      return;
    }

    setFileSizeError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    uploadFile(file);
  };

  const handleRetry = () => {
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  const handlePickFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();  // Close modal if clicked outside
    }
  };

  useEffect(() => {
    // Add event listener for clicks outside modal
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="attach-file-modal-overlay">
      <div className="attach-file-modal" ref={modalRef}>
        <h3>Select {fileType}</h3>

        {fileSizeError && <div className="error-message">{fileSizeError}</div>}

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept={
            fileType === "photo"
              ? "image/*"
              : fileType === "video"
              ? "video/*"
              : "application/pdf"
          }
          onChange={handleFileChange}
        />

        {previewUrl && (
          <div className="preview-area">
            {fileType === "photo" && <img src={previewUrl} alt="Preview" />}
            {fileType === "video" && (
              <video src={previewUrl} controls width="100%" />
            )}
            {fileType === "document" && (
              <div className="document-preview">
                <i className="ri-file-3-line"></i>
                <p>{selectedFile?.name}</p>
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          {isUploading ? (
            <div className="loading-spinner">Uploading...</div>
          ) : (
            <>
              <button onClick={handlePickFile} disabled={isUploading}>
                Choose File
              </button>
              <button onClick={onClose} disabled={isUploading}>
                Cancel
              </button>
            </>
          )}
        </div>

        {uploadError && (
          <div className="upload-error">
            <p>{uploadError}</p>
            <button onClick={handleRetry}>Retry</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachFileModal;
