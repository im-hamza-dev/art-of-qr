import React, { useState } from "react";
import axios from "axios";
import "./uploadFont.scss";
import Loading from "../../components/loading";
import { useNavigate } from "react-router-dom";

const UploadFont = ({ config, setConfig }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState(""); // State to hold status message
  const [isLoading, setLoading] = useState(false);
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]); // Capture selected file
    setStatusMessage(""); // Reset the status message on file change
  };
  const navigate = useNavigate();
  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("fontFile", selectedFile); // Append file to formData
    setLoading(true);
    try {
      const response = await axios.post(
        "https://font-file-server.vercel.app/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200)
        setStatusMessage("File uploaded successfully!"); // Update status message on success
    } catch (error) {
      setStatusMessage(error.statusMessage); // Update status message on failure
    }
    setLoading(false);
  };

  const moveBack = () => {
    navigate("/");
  };

  return (
    <>
      {isLoading && (
        <div className="loading">
          {" "}
          <Loading />
        </div>
      )}
      <h2>Configuration</h2>
      <div className="config-flexContainer">
        <div className="input-div">
          <h4 className="message">Upload only .ttf file</h4>
          <input
            type="file"
            className="input-field"
            onChange={handleFileChange}
          />
          <button className="upload-button" onClick={handleUpload}>
            Upload Font
          </button>

          {/* Display the status message */}
          {statusMessage && (
            <div className="status-message">{statusMessage}</div>
          )}
        </div>
        <div className="input-div">
          <h4 className="message">Text Formatting</h4>
          <div className="radio-flex">
            <button
              className={`option ${
                config.format === "center" ? "selected" : ""
              }`}
              onClick={() => setConfig({ format: "center" })}
            >
              Center
            </button>
            <button
              className={`option ${config.format === "left" ? "selected" : ""}`}
              onClick={() => setConfig({ format: "left" })}
            >
              Left
            </button>
          </div>
 
        </div>
      </div>
      <button onClick={moveBack}>Back</button>
    </>
  );
};

export default UploadFont;
