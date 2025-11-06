import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import star from "../assets/star.gif";
import back from "../assets/back.png";
import header from "../assets/header.png";
import smile from "../assets/smile.gif";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import { useRef } from "react";

const Digi: React.FC = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [isHide, setIsHide] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const location = useLocation();
  const selectedStyle = location.state?.style || "text";
  const navigate = useNavigate();
  const textBoxRef = useRef<HTMLDivElement | null>(null);
  const downloadAsImage = () => {
    if (!textBoxRef.current) return;

    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "fixed";
    hiddenContainer.style.top = "-9999px";
    hiddenContainer.style.left = "-9999px";

    hiddenContainer.innerHTML = textBoxRef.current.innerHTML;

    const computedStyles = getComputedStyle(textBoxRef.current);

    hiddenContainer.style.backgroundImage = computedStyles.backgroundImage;
    hiddenContainer.style.backgroundSize = computedStyles.backgroundSize;
    hiddenContainer.style.backgroundRepeat = computedStyles.backgroundRepeat;
    hiddenContainer.style.backgroundPosition =
      computedStyles.backgroundPosition;
    hiddenContainer.style.padding = computedStyles.padding;
    hiddenContainer.style.width = computedStyles.width;
    hiddenContainer.style.fontFamily = computedStyles.fontFamily;
    hiddenContainer.style.borderRadius = computedStyles.borderRadius;
    hiddenContainer.style.boxShadow = computedStyles.boxShadow;

    document.body.appendChild(hiddenContainer);

    html2canvas(hiddenContainer, { scale: 2 }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "extracted_text.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      document.body.removeChild(hiddenContainer);
    });
  };

  const uploadImage = (file: File) => {
    console.log("Uploading file to backend:", file);

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        console.log("Backend response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Backend upload response data:", data);
        if (data.status === "success") {
          setCapturedPhotoUrl(
            `http://localhost:5000/step_thresh.jpg?${Date.now()}`
          );
          setIsHide(true);

          fetch("http://localhost:5000/analyze")
            .then((res) => res.json())
            .then((analyzeData) => {
              console.log("Analyze response data:", analyzeData);
              if (analyzeData.status === "success") {
                setExtractedText(
                  analyzeData.gemini_response ||
                    analyzeData.extracted_text ||
                    "No text extracted."
                );
              } else {
                setExtractedText("Analysis failed: " + analyzeData.message);
              }
            })
            .catch((err) => {
              console.error("Analyze request error:", err);
              setExtractedText("Analysis request failed");
            });
        } else {
          setExtractedText("Upload failed: " + data.message);
        }
      })
      .catch((err) => {
        console.error("Upload error:", err);
        setExtractedText("Upload failed");
      });
  };

  const ChangeCamera = () => {
    setIsClicked(true);

    fetch("http://localhost:5000/capture", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Capture response:", data);

        if (data.status === "success") {
          setIsHide(true);
          setCapturedPhotoUrl(
            `http://localhost:5000/captured_photo.jpg?${Date.now()}`
          );

          fetch("http://localhost:5000/analyze")
            .then((res) => res.json())
            .then((analyzeData) => {
              console.log("Analyze response data:", analyzeData);
              if (analyzeData.status === "success") {
                setExtractedText(
                  analyzeData.gemini_response ||
                    analyzeData.extracted_text ||
                    "No text extracted."
                );
              } else {
                setExtractedText("Analysis failed: " + analyzeData.message);
              }
            })
            .catch((err) => {
              console.error("Analyze request error:", err);
              setExtractedText("Analysis request failed");
            });
        } else {
          setExtractedText("Capture failed: " + data.message);
        }
      })
      .catch((err) => {
        console.error("Capture error:", err);
        setExtractedText("Capture failed");
      });

    setTimeout(() => setIsClicked(false), 300);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imgDataUrl = reader.result as string;
        setUploadedImageUrl(imgDataUrl);
        setCapturedPhotoUrl(imgDataUrl);
        setIsHide(true);
      };
      reader.readAsDataURL(file);

      console.log("Dropped image file:", file);

      uploadImage(file);
    } else {
      console.warn("Dropped file is not an image");
      setExtractedText("Dropped file is not an image.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imgDataUrl = reader.result as string;
        setUploadedImageUrl(imgDataUrl);
        setCapturedPhotoUrl(imgDataUrl);
        setIsHide(true);
      };
      reader.readAsDataURL(file);

      console.log("Selected image file:", file);

      uploadImage(file);
    } else {
      console.warn("Selected file is not an image");
      setExtractedText("Selected file is not an image.");
    }
  };

  return (
    <div className="bg-lined-paper h-screen w-screen flex flex-col gap-5 items-center justify-center overflow-hidden">
      <img
        src={header}
        className="absolute w-48 top-5 fade-in-up right-10"
        alt=""
      />
      <button onClick={() => navigate("/Option")}>
        <motion.img
          className="absolute top-5 left-20 w-16 opacity-85"
          src={back}
          alt="Back"
          whileHover={{ scale: 1.2, rotate: -15 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      </button>
      {!isHide && (
        <>
          <img
            src={star}
            className="absolute w-24 top-12 right-73 z-10 fade-in-up"
            alt="Star"
          />
          <div className="tape absolute w-8 h-24 right-83 bottom-70 z-10"></div>
          <img
            src={smile}
            className="absolute w-16 top-94 rotate-23 left-102 z-10 fade-in-up"
            alt="Smile"
          />
        </>
      )}

      <div className="flex justify-center items-center gap-4 bg-black rounded-lg px-5 py-4 shadow-lg shadow-black fade-in-up transition-all duration-700">
        <div className="flex items-center">
          {extractedText ? (
            <div
              ref={textBoxRef}
              className="lined-paper-box h-64 w-96 overflow-y-auto p-4 bg-white rounded-lg shadow"
              style={{
                maxHeight: "16rem",
                fontFamily:
                  selectedStyle === "handwritten"
                    ? "caveat, cursive"
                    : "varela round, sans-serif",
              }}
            >
              {extractedText}
            </div>
          ) : !isHide ? (
            <img
              className="h-64 transition-opacity duration-500"
              src="http://localhost:5000/video_feed"
              alt="Video feed"
            />
          ) : (
            <img
              className="h-64 transition-opacity duration-500"
              src={capturedPhotoUrl}
              alt="Captured or Uploaded"
            />
          )}
        </div>

        <div className="flex items-center">
          {extractedText ? (
            <button
              className="w-20 h-20 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-95"
              onClick={downloadAsImage}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                />
              </svg>
            </button>
          ) : (
            <button className="relative" onClick={ChangeCamera}>
              <div className="w-20 h-20 bg-white rounded-full transition-transform duration-300 hover:scale-95"></div>
              <div
                className={`w-16 h-16 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 border-2
            ${isClicked ? "scale-90 bg-gray-100" : "bg-white border-gray-200"}
            transition-all duration-200 ease-in-out`}
              ></div>
            </button>
          )}
        </div>
      </div>

      <div
        className={`w-96 h-60 flex flex-col items-center justify-center border-4 rounded-2xl shadow-lg fade-in-up transition-all duration-700
        ${
          isDragOver
            ? "border-blue-400 bg-blue-50 scale-105"
            : "border-dashed border-gray-300 bg-gray-200 hover:shadow-xl hover:bg-gray-100 hover:scale-105 cursor-pointer"
        }
      `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        {uploadedImageUrl ? (
          <img
            src={uploadedImageUrl}
            alt="Uploaded preview"
            className="max-h-48 object-contain rounded-lg transition-all duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center transition-opacity duration-500">
            <svg
              className="w-12 h-12 mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5M7.5 12l4.5-4.5m0 0L16.5 12m-4.5-4.5V18"
              />
            </svg>
            <p className="text-gray-600 font-semibold text-center">
              Drop an image
            </p>
            <p className="text-gray-400 text-sm mt-1">or click to browse</p>
          </div>
        )}
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default Digi;
