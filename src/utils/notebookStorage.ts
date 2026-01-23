export interface SavedNotebook {
  id: string;
  userId: string;
  title: string;
  text: string;
  paperStyle: string;
  fontStyle: string;
  createdAt: string;
  updatedAt: string;
}

export const getNotebookById = (
  notebookId: string,
  userId: string
): SavedNotebook | null => {
  const notebooks = getSavedNotebooks(userId);
  return notebooks.find((n) => n.id === notebookId) ?? null;
};

export const saveNotebook = (notebook: Omit<SavedNotebook, 'id' | 'createdAt' | 'updatedAt'>): SavedNotebook => {
  const savedNotebooks = getSavedNotebooks();
  const newNotebook: SavedNotebook = {
    ...notebook,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  savedNotebooks.push(newNotebook);
  localStorage.setItem('scrible_notebooks', JSON.stringify(savedNotebooks));
  return newNotebook;
};

export const getSavedNotebooks = (userId?: string): SavedNotebook[] => {
  const notebooks = JSON.parse(localStorage.getItem('scrible_notebooks') || '[]');
  if (userId) {
    return notebooks.filter((n: SavedNotebook) => n.userId === userId);
  }
  return notebooks;
};

export const deleteNotebook = (notebookId: string, userId: string): boolean => {
  const notebooks = getSavedNotebooks();
  const filtered = notebooks.filter(
    (n: SavedNotebook) => !(n.id === notebookId && n.userId === userId)
  );
  localStorage.setItem('scrible_notebooks', JSON.stringify(filtered));
  return true;
};

export const updateNotebook = (notebookId: string, userId: string, updates: Partial<SavedNotebook>): SavedNotebook | null => {
  const notebooks = getSavedNotebooks();
  const index = notebooks.findIndex(
    (n: SavedNotebook) => n.id === notebookId && n.userId === userId
  );

  if (index === -1) return null;

  notebooks[index] = {
    ...notebooks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem('scrible_notebooks', JSON.stringify(notebooks));
  return notebooks[index];
};

export const appendToNotebookText = (
  notebookId: string,
  userId: string,
  textToAppend: string
): SavedNotebook | null => {
  const notebook = getNotebookById(notebookId, userId);
  if (!notebook) return null;

  const cleaned = (textToAppend || '').trim();
  if (!cleaned) return notebook;

  const stampedHeader = `[Appended ${new Date().toLocaleString()}]`;
  const separator = `\n\n---\n${stampedHeader}\n\n`;

  const nextText = notebook.text?.trim()
    ? `${notebook.text}${separator}${cleaned}`
    : cleaned;

  return updateNotebook(notebookId, userId, { text: nextText });
};
