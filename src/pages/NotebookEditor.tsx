import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";

import back from "../assets/back.png";
import header from "../assets/header.png";
import {
  appendToNotebookText,
  getNotebookById,
  updateNotebook,
} from "../utils/notebookStorage";
import type { SavedNotebook } from "../utils/notebookStorage";

const GUEST_USER_ID = "guest";

type PaperStyle =
  | "classic"
  | "blue"
  | "green"
  | "purple"
  | "grid"
  | "parchment"
  | "minimal";
type FontStyle = "handwritten" | "text";

const paperOptions: { id: PaperStyle; name: string; emoji: string }[] = [
  { id: "classic", name: "Classic", emoji: "📓" },
  { id: "blue", name: "Blue", emoji: "💙" },
  { id: "green", name: "Green", emoji: "💚" },
  { id: "purple", name: "Purple", emoji: "💜" },
  { id: "grid", name: "Grid", emoji: "📊" },
  { id: "parchment", name: "Parchment", emoji: "📜" },
  { id: "minimal", name: "Minimal", emoji: "📄" },
];

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

const getFontFamily = (fontStyle: string) => {
  return fontStyle === "handwritten"
    ? "caveat, cursive"
    : "varela round, sans-serif";
};

const NotebookEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notebook, setNotebook] = useState<SavedNotebook | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [paperStyle, setPaperStyle] = useState<PaperStyle>("classic");
  const [fontStyle, setFontStyle] = useState<FontStyle>("text");
  const [isLoading, setIsLoading] = useState(true);

  const [isDragOver, setIsDragOver] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [appendError, setAppendError] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsLoading(true);
    if (!id) {
      navigate("/SavedNotebooks");
      return;
    }
    const nb = getNotebookById(id, GUEST_USER_ID);
    if (!nb) {
      navigate("/SavedNotebooks");
      return;
    }
    setNotebook(nb);
    setTitle(nb.title);
    setText(nb.text);
    setPaperStyle((nb.paperStyle as PaperStyle) || "classic");
    setFontStyle((nb.fontStyle as FontStyle) || "text");
    setIsLoading(false);
  }, [id, navigate]);

  const paperClass = useMemo(() => getPaperStyleClass(paperStyle), [paperStyle]);
  const fontFamily = useMemo(() => getFontFamily(fontStyle), [fontStyle]);

  const handleSave = () => {
    if (!notebook) return;
    const updated = updateNotebook(notebook.id, GUEST_USER_ID, {
      title: title.trim() || notebook.title,
      text,
      paperStyle,
      fontStyle,
    });
    if (updated) setNotebook(updated);
  };

  const downloadAsImage = () => {
    if (!previewRef.current) return;

    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "fixed";
    hiddenContainer.style.top = "-9999px";
    hiddenContainer.style.left = "-9999px";
    hiddenContainer.innerHTML = previewRef.current.innerHTML;

    const computedStyles = getComputedStyle(previewRef.current);
    hiddenContainer.style.backgroundImage = computedStyles.backgroundImage;
    hiddenContainer.style.backgroundSize = computedStyles.backgroundSize;
    hiddenContainer.style.backgroundRepeat = computedStyles.backgroundRepeat;
    hiddenContainer.style.backgroundPosition = computedStyles.backgroundPosition;
    hiddenContainer.style.padding = computedStyles.padding;
    hiddenContainer.style.width = computedStyles.width;
    hiddenContainer.style.fontFamily = computedStyles.fontFamily;
    hiddenContainer.style.borderRadius = computedStyles.borderRadius;
    hiddenContainer.style.boxShadow = computedStyles.boxShadow;

    document.body.appendChild(hiddenContainer);

    html2canvas(hiddenContainer, { scale: 2 }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${(title || "notebook").replaceAll(" ", "_")}.png`;
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
            viewport,
            canvas,
          }).promise;

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], "pdf-page-1.jpg", { type: "image/jpeg" }));
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

  const appendFromFile = async (file: File) => {
    if (!notebook) return;

    setAppendError(null);
    setIsAppending(true);
    try {
      let fileToUpload = file;
      if (file.type === "application/pdf") {
        fileToUpload = await convertPdfToImage(file);
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const uploadRes = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      if (uploadJson.status !== "success") {
        setAppendError(uploadJson.message || "Upload failed");
        return;
      }

      const analyzeRes = await fetch("http://localhost:5000/analyze");
      const analyzeJson = await analyzeRes.json();
      if (analyzeJson.status !== "success") {
        setAppendError(analyzeJson.message || "Analyze failed");
        return;
      }

      const newText: string =
        (analyzeJson.gemini_response || analyzeJson.extracted_text || "").trim();
      if (!newText) {
        setAppendError("No text extracted from that file.");
        return;
      }

      const updated = appendToNotebookText(notebook.id, GUEST_USER_ID, newText);
      if (updated) {
        setNotebook(updated);
        setText(updated.text);
      }
    } catch (e: any) {
      setAppendError(e?.message || "Failed to append text");
    } finally {
      setIsAppending(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
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
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (isValidFile(file)) {
      await appendFromFile(file);
    } else {
      setAppendError("Please drop an image (JPG, PNG, etc.) or PDF.");
    }
  };

  if (isLoading || !notebook) {
    return (
      <div className="min-h-screen w-full bg-lined-paper flex items-center justify-center">
        <p className="text-xl font-mynerve text-zinc-600">Loading notebook...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-lined-paper relative overflow-x-hidden font-mynerve">
      {/* Back */}
      <motion.button
        onClick={() => navigate("/SavedNotebooks")}
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

      {/* Header */}
      <motion.div
        className="absolute top-6 right-6 md:right-12 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img src={header} alt="Scrible" className="w-40 md:w-48 h-auto" />
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-24 pb-16">
        <motion.div
          className="relative bg-white border-[3px] border-zinc-900 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 md:p-10 shadow-[10px_10px_0px_rgba(0,0,0,0.12)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-zinc-600 mb-1">
                Notebook title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-[2px] border-zinc-900 rounded-lg font-mynerve text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Untitled notebook"
              />
            </div>
            <div className="flex flex-wrap gap-3 justify-start md:justify-end">
              <button
                onClick={handleSave}
                className="sketchy-button-purple text-base px-5 py-2"
              >
                Save changes
              </button>
              <button
                onClick={downloadAsImage}
                className="sketchy-button-white text-base px-5 py-2"
              >
                Download PNG
              </button>
            </div>
          </div>

          {/* Preview + Edit */}
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <div>
              <p className="text-lg font-bold mb-2">Edit text</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-80 px-4 py-3 border-[2px] border-zinc-900 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ fontFamily }}
              />
              <p className="text-xs text-zinc-500 mt-2">
                Tip: you can paste/modify anything here.
              </p>
            </div>

            <div>
              <p className="text-lg font-bold mb-2">Notebook preview</p>
              <div
                ref={previewRef}
                className={`${paperClass} border-[2px] border-zinc-200 rounded-lg p-4 h-80 overflow-y-auto`}
                style={{ fontFamily }}
              >
                <p className="whitespace-pre-wrap text-sm">{text}</p>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                This preview uses your selected paper + font.
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-10 grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-lg font-bold mb-3">Font style</p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setFontStyle("handwritten")}
                  className={`sketchy-button-white text-base px-5 py-2 ${
                    fontStyle === "handwritten" ? "bg-purple-100" : ""
                  }`}
                  style={{ fontFamily: "caveat, cursive" }}
                >
                  Handwritten
                </button>
                <button
                  onClick={() => setFontStyle("text")}
                  className={`sketchy-button-white text-base px-5 py-2 ${
                    fontStyle === "text" ? "bg-purple-100" : ""
                  }`}
                  style={{ fontFamily: "varela round, sans-serif" }}
                >
                  Text
                </button>
              </div>
            </div>

            <div>
              <p className="text-lg font-bold mb-3">Paper style</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {paperOptions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPaperStyle(p.id)}
                    className={`border-[3px] border-zinc-900 rounded-lg p-3 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] ${
                      paperStyle === p.id ? "bg-purple-200" : "bg-white"
                    }`}
                  >
                    <div
                      className={`${getPaperStyleClass(
                        p.id
                      )} h-12 rounded mb-2 border border-zinc-300`}
                    />
                    <div className="text-xl">{p.emoji}</div>
                    <div className="text-xs font-bold">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Append from file */}
          <div className="mt-12">
            <p className="text-xl font-bold mb-3">Append more text (photo/PDF)</p>
            <div
              className={`relative bg-white border-[3px] border-zinc-900 rounded-[15px_255px_15px_225px/225px_15px_255px_15px] p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.12)] transition-all ${
                isDragOver ? "bg-blue-50 scale-[1.01]" : "hover:bg-zinc-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("appendFileInput")?.click()}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-zinc-800">
                    Drop an image/PDF here to append new text
                  </p>
                  <p className="text-sm text-zinc-600">
                    The extracted text will be added below your current text.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📎</span>
                  <span className="text-2xl">➕</span>
                </div>
              </div>

              {appendError && (
                <div className="mt-4 bg-red-100 border-2 border-red-500 rounded-lg p-3 text-red-700 text-center font-semibold">
                  {appendError}
                </div>
              )}

              {isAppending && (
                <div className="mt-4 text-center text-zinc-600 font-semibold">
                  Processing… (uploading + extracting)
                </div>
              )}

              <input
                id="appendFileInput"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,application/pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && isValidFile(file)) {
                    appendFromFile(file);
                  } else if (file) {
                    setAppendError("Please select an image (JPG, PNG, etc.) or PDF.");
                  }
                  e.currentTarget.value = "";
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Notebook margin line */}
      <div className="fixed top-0 left-20 bottom-0 w-[2px] bg-[#fca5a5] opacity-40 z-0" />
    </div>
  );
};

export default NotebookEditor;

