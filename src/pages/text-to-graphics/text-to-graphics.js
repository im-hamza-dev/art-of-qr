import React, { useRef, useState, useEffect } from "react";
import { toPng, toSvg, toCanvas } from "html-to-image";
import { changeDpiDataUrl, changeDpiBlob } from 'dpi-tools';
import download from "downloadjs";
import { MdErrorOutline } from "react-icons/md";
import "./text-to-graphics.scss"; // Import the CSS file
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { generateFileName } from "../../utils/helpers";
import { lettersPerRowMapCenter, lettersPerRowMapLeft } from "./help";
import Loading from "../../components/loading";



//font load glitch
// block space removal
// input with space and input without space adjustments

const TextToGraphics = ({ config, text, setText, textInput, setTextInput }) => {
  let defaultBoxSize = 60;
  const [printifyStatus, setPrintifyStatus] = useState(false); // Default text
  const [spacingBuffer, setSpacingBuffer] = useState(5); // Default text
  const [mockupUrl, setMockupUrl] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const qrRef = useRef();
  const textRef = useRef();
  const [boxSize, setBoxSize] = useState(defaultBoxSize); // Default square size
  const navigate = useNavigate();
  const [fontUrl, setFontUrl] = useState("");
  const [loader, setLoader] = useState(false);
  const [loderMsg, setLoderMsg] = useState("");

  useEffect(() => {
    if (text.length > 0) {
      let existingText = text;
      onChangeTextHandler(existingText + "a");
      setTimeout(() => {
        onChangeTextHandler(existingText);
      }, 100);
    }
  }, []);

  useEffect(() => {
    // Function to get the last modified time or create a version
    const fetchFontVersion = async () => {
      try {
        // Use Axios to send a HEAD request to get the font metadata
        const response = await axios.head(
          "https://peflgfeieqtklcpkhszz.supabase.co/storage/v1/object/public/fonts/user-font.ttf"
        );

        // Get the 'Last-Modified' header from the response
        const lastModified = response.headers["last-modified"];
        const version = Math.floor(Date.now() / 1000); // Convert to timestamp

        // Append the version as a query parameter to the font URL
        const fontUrlWithVersion = `https://peflgfeieqtklcpkhszz.supabase.co/storage/v1/object/public/fonts/user-font.ttf?v=${version}`;
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
          font-display: fallback;
        }
      `;
      console.log("font loading...");
      document.head.appendChild(styleSheet);
      if (qrRef.current) {
        qrRef.current.style.fontFamily = "CustomFont";
      }
    }
  }, [fontUrl]);




 

  const downloadPng = async () => {
    let graphic = document.getElementById("graphic-parent");
    if (graphic) {
      setSpacingBuffer(2);

      setTimeout(() => {
        toPng(graphic, {
          quality: 1, // Use the best quality for a clearer image
          canvasWidth: 3840, // Scale width for 300 PPI
          canvasHeight: 2160, // Scale height for 300 PPI
          
        })
          .then((dataUrl) => {
            const updatedURL=changeDpiDataUrl(dataUrl,300);
            download(updatedURL, `${generateFileName(text)}.png`);

            setSpacingBuffer(5);
          })
          .catch((err) => {
            console.error("Oops, something went wrong!", err);
          });
      }, 1000);
    }
  };

  // Function to handle SVG download
  const downloadSvg = () => {
    let graphic = document.getElementById("graphic-parent");
    if (graphic) {
      setSpacingBuffer(2);

      setTimeout(() => {
        toSvg(graphic)
          .then((dataUrl) => {
            download(dataUrl, `${generateFileName(text)}.svg`);
            setSpacingBuffer(5);
          })
          .catch((err) => {
            console.error("Oops, something went wrong!", err);
          });
      }, 1000);
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
    if (newSize > defaultBoxSize) {
      setBoxSize(newSize);
    }
  }, [text, spacingBuffer]);


  const timer = ms => new Promise(res => setTimeout(res, ms))

  const sendToPrintify = async () => {
    setMockupUrl([]);
    setLoderMsg("Generating Mockup...");
    setLoader(true);
    setErrorMsg('');
    let graphic = document.getElementById("graphic-parent");
    if (graphic) {
      setSpacingBuffer(2);

      setTimeout(() => {
        toPng(graphic, { quality: 0.3 })
          .then(async (dataUrl) => {
            setSpacingBuffer(5)
            let data_ = dataUrl.replace("data:image/png;base64,", "");
            console.log(dataUrl);
            let body;
            ;
            body = {
              file_name: `${generateFileName(text)}.png`,
              contents: dataUrl,
            };


            try {
              const response = await axios.post(
                //"http://localhost:3001/uploadImage",
                "https://font-file-server.vercel.app/uploadImage",
                body
              );
              if (response.status === 200) {
                setPrintifyStatus(true);
                setLoderMsg("Succesfuly Created mockups Now Getting Images...");
                const payload = encodeURIComponent(JSON.stringify(response.data.successfulMockups));
                console.log(payload);
                await timer(5000)
                const successfulUrls = await axios.get(`https://font-file-server.vercel.app/getMockup?payload=${payload}`);
                setLoader(false);
                if (successfulUrls.status == 200)
                  setMockupUrl(successfulUrls.data);
                else
                  setErrorMsg(successfulUrls.message);

                console.log(successfulUrls);

              }
              console.log(mockupUrl);
              if (response.status != 200) {
                setLoader(false);
                setErrorMsg(response.data.error)
              }

              return response.data;
            } catch (error) {
              console.error("Error uploading image:", error);
              setLoader(false);
              setErrorMsg(error.message);
              setPrintifyStatus(false);
            }
          })
          .catch((err) => {
            console.error("Oops, something went wrong!", err);
          });
      }, 1000);
    }
  };

  const onChangeTextHandler = (value) => {
    let inputWithoutSpace = value.replace(/\s/g, "");
    let maxLength = config.format === "center" ? 45 : 41;
    if (inputWithoutSpace.length > maxLength) return;
    if (inputWithoutSpace.replace(/\n/g, "").length > 36) return;
    setTextInput(value);
    let lettersWithoutLineBreak = inputWithoutSpace.replace(/\n/g, "");
    let lettersPerRowMap =
      config.format === "center"
        ? lettersPerRowMapCenter
        : lettersPerRowMapLeft;
    let spacingArr = lettersPerRowMap[lettersWithoutLineBreak?.length];
    let lettersWithNewLineBreak = "";
    lettersWithoutLineBreak?.split("").forEach((element, index) => {
      lettersWithNewLineBreak = `${lettersWithNewLineBreak}${element}${spacingArr?.includes(index + 1) ? "\n" : ""
        }`;
    });
    console.log("final:", lettersWithNewLineBreak);
    setText(lettersWithNewLineBreak);
  };

  return (
    <>
      <div className="qr-container">
        <h1>8-Bit Pixel Graphic</h1>
        <textarea
          rows="1"
          value={textInput.replace(/\n/g, "")}
          onChange={(e) => {
            onChangeTextHandler(e.target.value);
          }}
          placeholder="Enter text"
          className="qr-input"
        ></textarea>
        <span className="qr-textLength">
          {text.replace(/\n/g, "")?.length + " / " + 36}
        </span>
        <br />
        {text.length > 0 && (
          <div className="formatingDiv">
            {/* format-center */}
            <div className={`flex-graphics  `} id="graphic-parent">
              {config.format === "center" ? (
                <div
                  ref={qrRef}
                  className={`qr-box-centered`}
                  style={{
                    height: `${250}px`, // Dynamically set height based on text length
                    width: `${250}px`, // Dynamically set width based on text length
                    // fontFamily: "CustomFont",
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
                      {/* {getFormattedText()} */}
                      {text}
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
                      {/* {getFormattedText()} */}
                      {text}
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
                      {/* {getFormattedText()} */}
                      {text}
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
                      {/* {getFormattedText()} */}
                      {text}
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
                    // fontFamily: "CustomFont",
                  }}
                >
                  {/* Top text */}
                  <div
                    className="qr-text-top"
                    style={{
                      left:
                        textRef?.current?.clientHeight + (spacingBuffer - 10) ||
                        20,
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
                      bottom:
                        textRef?.current?.clientHeight + (spacingBuffer - 10),
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
              <button onClick={sendToPrintify}>Printful</button>
              <button
                onClick={() => {
                  navigate("/config");
                }}
              >
                Config
              </button>
              {printifyStatus && (
                <div className="status-message">
                  {"Graphics uploaded to Printful Successfully"}
                </div>
              )}
            </div>



          </div>

        )}
        <div className="horizontolLine"></div>
        <div>Print</div>
        {loader ? (<>
          <div style={{ color: 'red', fontWeight: 'normal', fontSize: '15px' }}>{loderMsg}</div>
          <Loading />
        </>) : (<></>

        )}
        {mockupUrl?.length ? (<div className="images-grid">{mockupUrl?.map((url, i) => {
          return (url.mockupUrl ? (<img key={i} style={{
            width: '100%',
            maxWidth: '400px',
            height: 'auto',
            borderRadius: '8px',
            margin: '5px'
          }} src={url.mockupUrl} />) : (<div className="error-container">
            <MdErrorOutline className="error-icon" />
            <span className="error-text">Unable to load image...</span>
          </div>))
        })}</div>) : (<div style={{ color: 'red', fontWeight: 'normal', fontSize: '15px' }}>{errorMsg}</div>)
        }

      </div>
    </>
  );
};

export default TextToGraphics;
