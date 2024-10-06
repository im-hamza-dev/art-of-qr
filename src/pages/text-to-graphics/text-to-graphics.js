import React, { useRef, useState, useEffect } from "react";
import { toPng, toSvg } from "html-to-image";
import download from "downloadjs";
import "./text-to-graphics.scss"; // Import the CSS file
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { generateFileName } from "../../utils/helpers";

const TextToGraphics = ({ config }) => {
  let defaultBoxSize = 60;
  const [text, setText] = useState(""); // Default text
  const [printifyStatus, setPrintifyStatus] = useState(false); // Default text
  const qrRef = useRef();
  const textRef = useRef();
  const [boxSize, setBoxSize] = useState(defaultBoxSize); // Default square size
  const navigate = useNavigate();
  const [fontUrl, setFontUrl] = useState("");

  const spacingBuffer = 20;

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
    let graphic = document.getElementById("graphic-parent");
    if (graphic) {
      toPng(graphic)
        .then((dataUrl) => {
          console.log(dataUrl);
          download(dataUrl, `${generateFileName(text)}.png`);
        })
        .catch((err) => {
          console.error("Oops, something went wrong!", err);
        });
    }
  };

  // Function to handle SVG download
  const downloadSvg = () => {
    let graphic = document.getElementById("graphic-parent");
    if (graphic) {
      toSvg(graphic)
        .then((dataUrl) => {
          download(dataUrl, `${generateFileName(text)}.svg`);
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
    if (newSize > defaultBoxSize) {
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
            file_name: `${generateFileName(text)}.png`,
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
    const chunks = text.match(/.{1,2}/g);
    let lineBreakMap = [0, 1, 3, 6, 10, 15];
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
        <textarea
          rows="2"
          value={text}
          onChange={(e) => {
            if (e.target.value.includes(" ")) return false;
            setText(e.target.value);
          }}
          placeholder="Enter text"
          className="qr-input"
          maxLength={40}
        ></textarea>
        {<span className="qr-textLength">{text.length + " / " + 40}</span>}
        <br />
        {text.length > 0 && (
          <>
            {/* format-center */}
            <div className="flex-graphics" id="graphic-parent">
              {config.format === "center" ? (
                <div
                  ref={qrRef}
                  className="qr-box-centered"
                  style={{
                    height: `${210}px`, // Dynamically set height based on text length
                    width: `${210}px`, // Dynamically set width based on text length
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
                      left:
                        textRef?.current?.clientHeight + spacingBuffer || 20,
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
            <br />
            <div className="qr-download-buttons">
              <button onClick={downloadPng} className="qr-download-button">
                Download as PNG
              </button>
              <button onClick={downloadSvg}>Download as SVG</button>
              <button onClick={sendToPrintify}>Printify</button>
              <button
                onClick={() => {
                  navigate("/config");
                }}
              >
                Config
              </button>
            </div>

            {printifyStatus && (
              <div className="status-message">
                {"Graphics uploaded to Printify successfully"}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default TextToGraphics;
