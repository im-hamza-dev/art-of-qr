import React, { useState } from 'react';
import axios from 'axios';
import "./uploadFont.css"
import Loading from '../../components/loading';

const UploadFont = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState(''); // State to hold status message
  const [isLoading,setLoading]=useState(false);
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);  // Capture selected file
    setStatusMessage('');  // Reset the status message on file change
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage('Please select a file to upload.');
      return;
    }
    
    const formData = new FormData();
    formData.append('fontFile', selectedFile);  // Append file to formData
    setLoading(true);
    try {
      const response = await axios.post('https://font-file-server.vercel.app/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if(response.status===200)
            setStatusMessage('File uploaded successfully!');  // Update status message on success
    } catch (error) {
        setStatusMessage(error.statusMessage);  // Update status message on failure
    }
    setLoading(false);
  };

  return (
    <>
    {isLoading && <div className='loading'> <Loading/></div>}
    <div className='message'>Upload only .ttf file</div>
    <div className="input-div">
      <input type="file" className="input-field" onChange={handleFileChange} />
      <button className="upload-button" onClick={handleUpload}>Upload Font</button>

      {/* Display the status message */}
      {statusMessage && <div className="status-message">{statusMessage}</div>}
    </div>
    </>
  );
};

export default UploadFont;
