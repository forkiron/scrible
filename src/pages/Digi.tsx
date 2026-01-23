import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import star from "../assets/star.gif";
import back from "../assets/back.png";
import header from "../assets/header.png";
import smile from "../assets/smile.gif";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { saveNotebook } from "../utils/notebookStorage";

const GUEST_USER_ID = "guest";

const getPaperStyleClass = (style: string) => {
  const styleMap: Record<string, string> = {
    classic: "paper-classic",
    blue: "paper-blue",
    green: "paper-green",
    purple: "paper-purple",
    grid: "paper-grid",
    parchment: "paper-parchment",
    minimal: "paper-minimal",
  };
  return styleMap[style] || "paper-classic";
};

const Digi: React.FC = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [isHide, setIsHide] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedPaperStyle, setSelectedPaperStyle] = useState<string>("classic");
  const navigate = useNavigate();
  const textBoxRef = useRef<HTMLDivElement | null>(null);

  const handleChooseFontStyle = (style: "handwritten" | "text") => {
    setSelectedStyle(style);

    // Auto-create a notebook immediately and jump into editor.
    if (extractedText) {
      const nb = saveNotebook({
        userId: GUEST_USER_ID,
        title: `Notebook ${new Date().toLocaleString()}`,
        text: extractedText,
        paperStyle: selectedPaperStyle,
        fontStyle: style,
      });
      navigate(`/notebook/${nb.id}`);
    }
  };
  
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

  const convertPdfToImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (!e.target?.result || !(e.target.result instanceof ArrayBuffer)) {
            reject(new Error("Failed to read PDF file"));
            return;
          }

          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

          const pdf = await pdfjsLib.getDocument({ data: e.target.result })
            .promise;
          const page = await pdf.getPage(1);

          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const imageFile = new File([blob], "pdf-page-1.jpg", {
                  type: "image/jpeg",
                });
                resolve(imageFile);
              } else {
                reject(new Error("Failed to convert PDF to image"));
              }
            },
            "image/jpeg",
            0.95
          );
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
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
                setSelectedStyle(null); // Reset style selection when new text is extracted
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
                setSelectedStyle(null); // Reset style selection when new text is extracted
                setSelectedPaperStyle("classic"); // Reset paper style
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

  const isValidFile = (file: File): boolean => {
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp"];
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".pdf"];
    const fileName = file.name.toLowerCase();
    
    // Check MIME type
    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      return true;
    }
    
    // Fallback: check file extension
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      let fileToUpload = file;

      if (file.type === "application/pdf") {
        try {
          setExtractedText("Converting PDF to image...");
          fileToUpload = await convertPdfToImage(file);
        } catch (error) {
          console.error("Error converting PDF:", error);
          setExtractedText("Failed to convert PDF. Please try an image file.");
          return;
        }
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imgDataUrl = reader.result as string;
        setUploadedImageUrl(imgDataUrl);
        setCapturedPhotoUrl(imgDataUrl);
        setIsHide(true);
      };
      reader.readAsDataURL(fileToUpload);

      uploadImage(fileToUpload);
    } else {
      console.warn("Dropped file is not an image or PDF");
      setExtractedText("Dropped file is not an image or PDF.");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      let fileToUpload = file;

      if (file.type === "application/pdf") {
        try {
          setExtractedText("Converting PDF to image...");
          fileToUpload = await convertPdfToImage(file);
        } catch (error) {
          console.error("Error converting PDF:", error);
          setExtractedText("Failed to convert PDF. Please try an image file.");
          return;
        }
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imgDataUrl = reader.result as string;
        setUploadedImageUrl(imgDataUrl);
        setCapturedPhotoUrl(imgDataUrl);
        setIsHide(true);
      };
      reader.readAsDataURL(fileToUpload);

      uploadImage(fileToUpload);
    } else {
      console.warn("Selected file is not an image or PDF");
      setExtractedText("Selected file is not an image or PDF.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-lined-paper relative overflow-x-hidden font-mynerve">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 md:left-12 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.1, rotate: -5 }}
      >
        <img
          src={back}
          alt="Back"
          className="w-12 md:w-16 opacity-90 hover:opacity-100 transition-opacity"
        />
      </motion.button>

      {/* Header Logo */}
      <motion.div
        className="absolute top-6 right-6 md:right-12 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img
          src={header}
          alt="Scrible"
          className="w-40 md:w-48 h-auto"
        />
      </motion.div>

      {/* Decorative Elements */}
      {!isHide && (
        <>
          <motion.img
            src={star}
            className="absolute top-20 right-32 w-16 md:w-20 opacity-60 z-10"
            alt="Star"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          />
          <motion.img
            src={smile}
            className="absolute bottom-32 left-16 w-14 md:w-18 opacity-60 z-10"
            alt="Smile"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          />
        </>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-24 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-center justify-center">
          
          {/* Camera Section */}
          <motion.div
            className="w-full lg:w-auto flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Camera Preview Box */}
            <div className="relative bg-white border-[3px] border-zinc-900 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.15)]">
              <div className="w-full md:w-96 h-64 bg-zinc-100 rounded-lg overflow-hidden flex items-center justify-center">
                {extractedText && selectedStyle ? (
                  <div
                    ref={textBoxRef}
                    className={`${getPaperStyleClass(selectedPaperStyle)} h-full w-full overflow-y-auto p-4 rounded-lg border-2 border-zinc-200`}
                    style={{
                      fontFamily:
                        selectedStyle === "handwritten"
                          ? "caveat, cursive"
                          : "varela round, sans-serif",
                    }}
                  >
                    <p className="text-sm whitespace-pre-wrap">{extractedText}</p>
                  </div>
                ) : isCameraOpen && !isHide ? (
                  <img
                    className="h-full w-full object-cover transition-opacity duration-500"
                    src="http://localhost:5000/video_feed"
                    alt="Video feed"
                  />
                ) : !isHide ? (
                  <div className="text-center p-8">
                    <p className="text-zinc-500 text-lg font-medium">
                      Click "Open Camera" to start
                    </p>
                  </div>
                ) : (
                  <img
                    className="h-full w-full object-contain transition-opacity duration-500"
                    src={capturedPhotoUrl}
                    alt="Captured or Uploaded"
                  />
                )}
              </div>
              
              {/* Camera Button */}
              {!extractedText && (
                <div className="flex justify-center mt-4">
                  {isCameraOpen && !isHide ? (
                    <motion.button
                      onClick={ChangeCamera}
                      className="relative"
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="w-16 h-16 bg-white border-[3px] border-zinc-900 rounded-full shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all"></div>
                      <div
                        className={`w-12 h-12 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 border-2 border-zinc-900
                        ${isClicked ? "scale-90 bg-zinc-200" : "bg-white"}
                        transition-all duration-200 ease-in-out`}
                      ></div>
                    </motion.button>
                  ) : null}
                </div>
              )}
            </div>

            {/* Open Camera Button */}
            {!isCameraOpen && !isHide && (
              <motion.button
                onClick={() => setIsCameraOpen(true)}
                className="sketchy-button-purple text-lg md:text-xl px-8 py-3 shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Open Camera
              </motion.button>
            )}

            {/* Action Buttons (when text is extracted and style is selected) */}
            {extractedText && selectedStyle && (
              <div className="flex flex-wrap gap-4 justify-center">
                <motion.button
                  className="sketchy-button-white text-lg md:text-xl px-8 py-3 shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center gap-2"
                  onClick={downloadAsImage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <svg
                    className="w-5 h-5"
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
                  Download
                </motion.button>
                <motion.button
                  className="sketchy-button-white text-lg md:text-xl px-8 py-3 shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center gap-2"
                  onClick={() => navigate("/SavedNotebooks")}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  My Notebooks
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* File Upload Section */}
          <motion.div
            className="w-full lg:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div
              className={`relative bg-white border-[3px] border-zinc-900 rounded-[15px_255px_15px_225px/225px_15px_255px_15px] p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.15)] cursor-pointer transition-all
              ${
                isDragOver
                  ? "border-blue-400 bg-blue-50 scale-105 shadow-[12px_12px_0px_rgba(0,0,0,0.2)]"
                  : "hover:shadow-[12px_12px_0px_rgba(0,0,0,0.2)] hover:scale-[1.02]"
              }
              w-full md:w-96 h-64 flex flex-col items-center justify-center`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              {uploadedImageUrl ? (
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded preview"
                  className="max-h-full max-w-full object-contain rounded-lg transition-all duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <svg
                    className="w-16 h-16 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5M7.5 12l4.5-4.5m0 0L16.5 12m-4.5-4.5V18"
                    />
                  </svg>
                  <p className="text-zinc-700 font-bold text-xl text-center">
                    Drop an image or PDF
                  </p>
                  <p className="text-zinc-500 text-sm">or click to browse</p>
                </div>
              )}
              <input
                type="file"
                id="fileInput"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,application/pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </motion.div>

        </div>

        {/* Font Style Selection (shown after text is extracted) */}
        {extractedText && !selectedStyle && (
          <motion.div
            className="mt-12 flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-zinc-800">
              Choose Your Font Style
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Handwritten Style Option */}
              <motion.button
                onClick={() => handleChooseFontStyle("handwritten")}
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <div className="absolute top-2 right-2 w-full h-full bg-yellow-800/40 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]"></div>
                  <div className="relative bg-yellow-400 border-[3px] border-zinc-900 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 md:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.15)] cursor-pointer transition-all hover:shadow-[12px_12px_0px_rgba(0,0,0,0.2)]">
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <h4 className="text-xl md:text-2xl font-bold underline decoration-zinc-900 decoration-2" style={{ fontFamily: "Caveat, cursive" }}>
                        Handwritten style
                      </h4>
                      <p className="text-base md:text-lg font-medium">
                        Original. With a buttery finish.
                      </p>
                      <div className="text-4xl md:text-5xl mt-2">
                        🧈✍️
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Text Font Option */}
              <motion.button
                onClick={() => handleChooseFontStyle("text")}
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <div className="absolute top-2 left-2 w-full h-full bg-sky-800/40 rounded-[15px_255px_15px_225px/225px_15px_255px_15px]"></div>
                  <div className="relative bg-sky-300 border-[3px] border-zinc-900 rounded-[15px_255px_15px_225px/225px_15px_255px_15px] p-6 md:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.15)] cursor-pointer transition-all hover:shadow-[12px_12px_0px_rgba(0,0,0,0.2)]">
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <h4 className="text-xl md:text-2xl font-bold underline decoration-zinc-900 decoration-2" style={{ fontFamily: "Varela Round, sans-serif" }}>
                        Text font
                      </h4>
                      <p className="text-base md:text-lg font-medium" style={{ fontFamily: "Varela Round, sans-serif" }}>
                        Sleek, modern, perfect for assignments.
                      </p>
                      <div className="text-4xl md:text-5xl mt-2">
                        📖
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Paper Style Selection (shown after font style is selected) */}
        {extractedText && selectedStyle && (
          <motion.div
            className="mt-8 flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h3 className="text-xl md:text-2xl font-bold text-zinc-800">
              Choose Your Paper Style
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
              {[
                { id: "classic", name: "Classic", emoji: "📓" },
                { id: "blue", name: "Blue", emoji: "💙" },
                { id: "green", name: "Green", emoji: "💚" },
                { id: "purple", name: "Purple", emoji: "💜" },
                { id: "grid", name: "Grid", emoji: "📊" },
                { id: "parchment", name: "Parchment", emoji: "📜" },
                { id: "minimal", name: "Minimal", emoji: "📄" },
              ].map((style) => (
                <motion.button
                  key={style.id}
                  onClick={() => setSelectedPaperStyle(style.id)}
                  className={`relative border-[3px] border-zinc-900 rounded-lg p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] transition-all ${
                    selectedPaperStyle === style.id
                      ? "bg-purple-200 scale-105"
                      : "bg-white hover:bg-zinc-50"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`${getPaperStyleClass(style.id)} h-20 rounded mb-2 border border-zinc-300`}></div>
                  <div className="text-2xl mb-1">{style.emoji}</div>
                  <p className="text-sm font-bold">{style.name}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* Notebook margin line */}
      <div className="fixed top-0 left-20 bottom-0 w-[2px] bg-[#fca5a5] opacity-40 z-0" />
    </div>
  );
};

export default Digi;
