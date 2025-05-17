// src/components/Chat/CameraModal.jsx

import React, { useRef, useState } from "react";

const CameraModal = ({ onClose, onCapture }) => {
  const videoRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // Start Camera
  React.useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera not accessible:", err);
      }
    }
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture Photo
  const handleCapture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData);
    const file = dataURLtoFile(imageData, "captured_photo.png");

    onCapture({
      file: file,
      previewUrl: imageData,
      type: "photo",
    });
  };

  // Helper function
  const dataURLtoFile = (dataUrl, filename) => {
    let arr = dataUrl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div className="camera-modal-overlay">
      <div className="camera-modal">
        {!capturedImage ? (
          <>
            <video ref={videoRef} autoPlay playsInline width="100%" />
            <button onClick={handleCapture}>Capture</button>
          </>
        ) : (
          <img src={capturedImage} alt="Captured" />
        )}

        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
