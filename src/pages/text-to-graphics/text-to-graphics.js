import React, { useRef, useState, useEffect } from "react";
import { toPng, toSvg } from "html-to-image";
import download from "downloadjs";
import "./text-to-graphics.scss"; // Import the CSS file
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TextToGraphics = ({ config }) => {
  const [text, setText] = useState(""); // Default text
  const qrRef = useRef();
  const textRef = useRef();
  const [boxSize, setBoxSize] = useState(260); // Default square size
  const navigate = useNavigate();
  const spacingBuffer = 20;




  const downloadPng = () => {
    if (qrRef.current) {
      toPng(qrRef.current)
        .then((dataUrl) => {
          console.log(dataUrl);
          download(dataUrl, "qr-code-border.png");
        })
        .catch((err) => {
          console.error("Oops, something went wrong!", err);
        });
    }
  };

  // Function to handle SVG download
  const downloadSvg = () => {
    if (qrRef.current) {
      toSvg(qrRef.current)
        .then((dataUrl) => {
          download(dataUrl, "qr-code-border.svg");
        })
        .catch((err) => {
          console.error("Oops, something went wrong!", err);
        });
    }
  };
  // Calculate the box size dynamically based on text length
  useEffect(() => {
 
    if (!textRef.current) {
      return;
    }
    const textLength = text.length;
    let textWidth = textRef.current.clientWidth;
    // const newSize = Math.max(120, textLength * 30); // Adjust size scaling factor
    const newSize = textWidth + textRef.current.clientHeight + spacingBuffer; // Adjust size scaling factor
    console.log("height:", newSize, textLength, textRef.current.clientHeight);
    setBoxSize(newSize);
  }, [text]);
  


  const sendToPrintify = async () => {
    if (qrRef.current) {
      toPng(qrRef.current)
        .then(async (dataUrl) => {
          let body = {
            filename: `${text}.png`,
            contents: dataUrl,
          };
          try {
            const response = await axios.post(
              "https://api.printify.com/v1/shops/18282700/uploads/images.json",
              body,
              {
                headers: {
                  bearer:
                    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjA0ZjY5MjVhM2E4MDUyYjk1MjBjNzBmNDBlNDY5NTQxZjFiMmJiNDY0YWZjNTVlYThjYzA1ZTAwZTI0NmIwMjk1NDAxMTUxNzgwNDZhNzExIiwiaWF0IjoxNzI3NDYxNjk4LjUwMjczOSwibmJmIjoxNzI3NDYxNjk4LjUwMjc0MiwiZXhwIjoxNzU4OTk3Njk4LjQ5NjI3NSwic3ViIjoiMTk5ODg1OTgiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIiwidXNlci5pbmZvIl19.AtN5V7sugdIrbrFJQkL5EhLiatBiMdEn6tGfn7nVaCxs254S3wtCKwv8Ebvgu1xXND8ExfDkUuWamgmL3NU",
                  "Content-Type": "application/json",
                },
              }
            );
            return response.data;
          } catch (error) {
            console.error("Error uploading image:", error);
          }
        })
        .catch((err) => {
          console.error("Oops, something went wrong!", err);
        });
    }
  };

  return (
    <>
      <div className="qr-container">
        <h1>8-Bit Pixel Graphic</h1>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
          className="qr-input"
          maxLength={40}
        />
        <div
          ref={qrRef}
          className="qr-box"
          style={{
            height: `${boxSize}px`, // Dynamically set height based on text length
            width: `${boxSize}px`, // Dynamically set width based on text length
          }}
        >
          {/* Top text */}
          <div
            className="qr-text-top"
            style={{
              left: textRef?.current?.clientHeight + spacingBuffer || 20,
              // fontSize: `${boxSize / fontFactor}px`, // Dynamically adjust font size
            }}
            ref={textRef}
          >
            {text}
          </div>

          {/* Bottom text */}
          <div
            className="qr-text-bottom"
            style={
              {
                // fontSize: `${boxSize / fontFactor}px`, // Dynamically adjust font size
              }
            }
          >
            {text}
          </div>

          {/* Left text (rotated) */}
          <div
            className="qr-text-left"
            style={{
              // fontSize: `${boxSize / fontFactor}px`, // Dynamically adjust font size
              bottom: textRef?.current?.clientHeight + spacingBuffer,
            }}
          >
            {text}
          </div>

          {/* Right text (rotated) */}
          <div
            className="qr-text-right"
            style={
              {
                // fontSize: `${boxSize / fontFactor}px`, // Dynamically adjust font size
              }
            }
          >
            {text}
          </div>
        </div>
        <div className="qr-download-buttons">
          <button onClick={downloadPng} className="qr-download-button">
            Download as PNG
          </button>
          <button onClick={downloadSvg}>Download as SVG</button>
          <button onClick={sendToPrintify}>Printify</button>
        </div>
        <button
          onClick={() => {
            navigate("/config");
          }}
        >
          Config
        </button>
      </div>
    </>
  );
};

export default TextToGraphics;
