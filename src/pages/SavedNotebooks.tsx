import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSavedNotebooks, deleteNotebook } from '../utils/notebookStorage';
import type { SavedNotebook } from '../utils/notebookStorage';
import header from '../assets/header.png';
import back from '../assets/back.png';

const GUEST_USER_ID = "guest";

const SavedNotebooks = () => {
  const navigate = useNavigate();
  const [notebooks, setNotebooks] = useState<SavedNotebook[]>([]);

  useEffect(() => {
    setNotebooks(getSavedNotebooks(GUEST_USER_ID));
  }, []);

  const handleDelete = (notebookId: string) => {
    if (window.confirm('Are you sure you want to delete this notebook?')) {
      deleteNotebook(notebookId, GUEST_USER_ID);
      setNotebooks(getSavedNotebooks(GUEST_USER_ID));
    }
  };

  const getPaperStyleClass = (style: string) => {
    const styleMap: Record<string, string> = {
      classic: 'paper-classic',
      blue: 'paper-blue',
      green: 'paper-green',
      purple: 'paper-purple',
      grid: 'paper-grid',
      parchment: 'paper-parchment',
      minimal: 'paper-minimal',
    };
    return styleMap[style] || 'paper-classic';
  };

  const getFontFamily = (fontStyle: string) => {
    const fontMap: Record<string, string> = {
      handwritten: 'caveat, cursive',
      text: 'varela round, sans-serif',
      mynerve: 'Mynerve, cursive',
      arimo: 'Arimo, sans-serif',
      raleway: 'Raleway, sans-serif',
    };
    return fontMap[fontStyle] || 'varela round, sans-serif';
  };

  return (
    <div className="min-h-screen w-full bg-lined-paper relative overflow-x-hidden font-mynerve">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/Digi')}
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
        <img src={header} alt="Scrible" className="w-40 md:w-48 h-auto" />
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-zinc-800">
            My Notebooks
          </h1>

          {notebooks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-zinc-600 mb-4">No saved notebooks yet!</p>
              <button
                onClick={() => navigate('/Digi')}
                className="sketchy-button-purple text-lg px-8 py-3"
              >
                Create Your First Notebook
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notebooks.map((notebook, index) => (
                <motion.div
                  key={notebook.id}
                  className="relative bg-white border-[3px] border-zinc-900 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.1)]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-zinc-800 truncate flex-1">
                      {notebook.title}
                    </h3>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => navigate(`/notebook/${notebook.id}`)}
                        className="sketchy-button-white text-xs px-3 py-1"
                        title="Edit notebook"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(notebook.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete notebook"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div
                    className={`${getPaperStyleClass(notebook.paperStyle)} p-4 rounded-lg mb-4 h-48 overflow-y-auto border-2 border-zinc-200`}
                    style={{ fontFamily: getFontFamily(notebook.fontStyle) }}
                  >
                    <p className="notebook-text whitespace-pre-wrap">{notebook.text}</p>
                  </div>

                  <div className="text-xs text-zinc-500 space-y-1">
                    <p>Style: {notebook.paperStyle} • {notebook.fontStyle}</p>
                    <p>
                      {new Date(notebook.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Notebook margin line */}
      <div className="fixed top-0 left-20 bottom-0 w-[2px] bg-[#fca5a5] opacity-40 z-0" />
    </div>
  );
};

export default SavedNotebooks;
