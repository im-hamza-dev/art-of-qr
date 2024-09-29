import React, { useRef, useState, useEffect } from "react";
import { toPng, toSvg } from "html-to-image";
import download from "downloadjs";
import "./text-to-graphics.scss"; // Import the CSS file

const TextToGraphics = () => {
  const [text, setText] = useState(""); // Default text
  const qrRef = useRef();
  const textRef = useRef();
  const [boxSize, setBoxSize] = useState(200); // Default square size
  const fontFactor = 6;

  // Function to handle PNG download
  const downloadPng = () => {
    if (qrRef.current) {
      toPng(qrRef.current)
        .then((dataUrl) => {
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
    const newSize = textWidth + textRef.current.clientHeight; // Adjust size scaling factor
    console.log("height:", newSize, textLength, textRef.current.clientHeight);
    setBoxSize(newSize);
  }, [text]);

  return (
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
            left: textRef?.current?.clientHeight || 20,
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
            bottom: textRef?.current?.clientHeight - 4,
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
      </div>
    </div>
  );
};

export default TextToGraphics;
