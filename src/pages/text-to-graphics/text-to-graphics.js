import React, { useRef, useState, useEffect } from "react";
import { toPng, toSvg } from "html-to-image";
import download from "downloadjs";
import "./text-to-graphics.scss"; // Import the CSS file
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TextToGraphics = ({ config }) => {
  const [text, setText] = useState(""); // Default text
  const [printifyStatus, setPrintifyStatus] = useState(false); // Default text
  const qrRef = useRef();
  const textRef = useRef();
  const [boxSize, setBoxSize] = useState(260); // Default square size
  const navigate = useNavigate();
  const [fontUrl, setFontUrl] = useState("");

  const spacingBuffer = 20;
  //

  useEffect(() => {
    // Function to get the last modified time or create a version
    const fetchFontVersion = async () => {
      try {
        // Use Axios to send a HEAD request to get the font metadata
        const response = await axios.head(
          "https://cynlnxqqcyuxauxvxcjf.supabase.co/storage/v1/object/public/fonts/user-font.ttf"
        );

        // Get the 'Last-Modified' header from the response
        const lastModified = response.headers["last-modified"];
        const version = Math.floor(Date.now() / 1000); // Convert to timestamp

        // Append the version as a query parameter to the font URL
        const fontUrlWithVersion = `https://cynlnxqqcyuxauxvxcjf.supabase.co/storage/v1/object/public/fonts/user-font.ttf?v=${version}`;

        setFontUrl(fontUrlWithVersion);
      } catch (error) {
        console.error("Error fetching font metadata:", error);
      }
    };

    fetchFontVersion();
  }, []);

  // Dynamically inject the font-face CSS when the font URL is ready
  useEffect(() => {
    if (fontUrl) {
      const styleSheet = document.createElement("style");
      styleSheet.textContent = `
        @font-face {
          font-family: 'CustomFont';
          src: url('${fontUrl}') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, [fontUrl]);

  //
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
    if (newSize > 200) {
      setBoxSize(newSize);
    }
  }, [text]);

  const sendToPrintify = async () => {
    if (qrRef.current) {
      toPng(qrRef.current)
        .then(async (dataUrl) => {
          console.log(dataUrl);
          let data_ = dataUrl.replace("data:image/png;base64,", "");
          let body = {
            file_name: `${text}.png`,
            contents: data_,
          };
          try {
            const response = await axios.post(
              "https://font-file-server.vercel.app/upload-printify",
              body
            );
            setPrintifyStatus(true);
            console.log(response);
            return response.data;
          } catch (error) {
            console.error("Error uploading image:", error);
            setPrintifyStatus(false);
          }
        })
        .catch((err) => {
          console.error("Oops, something went wrong!", err);
        });
    }
  };

  const getFormattedText = () => {
    let textContainer = document.getElementById("triangle-bottom");
    const chunks = text.match(/.{1,3}/g);
    let lineBreakMap = [0, 4, 9];
    console.log(chunks);
    return (
      <div>
        {chunks?.map((chunk, index) => (
          <span key={index}>
            {chunk}
            {lineBreakMap.includes(index) && <br />}
          </span>
        ))}
      </div>
    );
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
        {/* format-center */}
        <div className="flex-graphics">
          {config.format === "center" ? (
            <div
              ref={qrRef}
              className="qr-box-centered"
              style={{
                height: `${200}px`, // Dynamically set height based on text length
                width: `${200}px`, // Dynamically set width based on text length
                fontFamily: "CustomFont",
              }}
            >
              <div
                className="triangle qr-text-bottom-right-centered left"
                style={
                  {
                    // fontSize: `${boxSize / fontFactor}px`, // Dynamically adjust font size
                  }
                }
                id="triangle-bottom"
              >
                <div className="triangle-content-parent">
                  {getFormattedText()}
                </div>
              </div>

              <div
                className="triangle qr-text-bottom-right-centered top"
                style={
                  {
                    // fontSize: `${boxSize / fontFactor}px`, // Dynamically adjust font size
                  }
                }
                id="triangle-bottom"
              >
                <div className="triangle-content-parent">
                  {getFormattedText()}
                </div>
              </div>
              <div
                className="triangle qr-text-bottom-right-centered right"
                style={
                  {
                    // fontSize: `${boxSize / fontFactor}px`, // Dynamically adjust font size
                  }
                }
                id="triangle-bottom"
              >
                <div className="triangle-content-parent">
                  {getFormattedText()}
                </div>
              </div>
              <div
                className="triangle qr-text-bottom-right-centered"
                style={
                  {
                    // fontSize: `${boxSize / fontFactor}px`, // Dynamically adjust font size
                  }
                }
                id="triangle-bottom"
              >
                <div className="triangle-content-parent">
                  {getFormattedText()}
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={qrRef}
              className="qr-box"
              style={{
                height: `${boxSize}px`, // Dynamically set height based on text length
                width: `${boxSize}px`, // Dynamically set width based on text length
                fontFamily: "CustomFont",
              }}
            >
              {/* Top text */}
              <div
                className="qr-text-top"
                style={{
                  left: textRef?.current?.clientHeight + spacingBuffer || 20,
                  // fontSize: `${boxSize / fontFactor}px`, // Dynamically adjust font size
                }}
                
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
                ref={textRef}
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
          )}
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
        {printifyStatus && (
          <div className="status-message">
            {"Graphics uploaded to Printify successfully"}
          </div>
        )}
      </div>
    </>
  );
};

export default TextToGraphics;
