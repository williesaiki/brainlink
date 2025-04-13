import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, X } from 'lucide-react';
import { colors } from '../../../config/colors';
import { toast } from 'sonner';
import { auth, db } from '../../../lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: Date;
}

function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const notesQuery = query(
        collection(db, 'notes'),
        where('user_id', '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(notesQuery);
      const fetchedNotes: Note[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedNotes.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          created_at: data.created_at.toDate()
        });
      });

      setNotes(fetchedNotes.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()));
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Nie udało się załadować notatek');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      if (!newNote.title || !newNote.content) {
        toast.error('Tytuł i treść są wymagane');
        return;
      }

      const noteData = {
        ...newNote,
        user_id: currentUser.uid,
        created_at: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'notes'), noteData);

      setNotes(prev => [{
        id: docRef.id,
        ...newNote,
        created_at: new Date()
      }, ...prev]);

      setShowAddForm(false);
      setNewNote({
        title: '',
        content: ''
      });

      toast.success('Notatka dodana');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Nie udało się dodać notatki');
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Notatka usunięta');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Nie udało się usunąć notatki');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000008] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Notatki</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className={`${colors.button.primary} px-4 py-2 rounded-lg flex items-center gap-2`}
          >
            <Plus className="w-5 h-5" />
            Dodaj notatkę
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${colors.card.stats} p-6 rounded-lg relative group`}
            >
              <button
                onClick={() => deleteNote(note.id)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-medium text-white mb-2">{note.title}</h3>
              <p className="text-gray-400 whitespace-pre-wrap">{note.content}</p>
              <div className="mt-4 text-sm text-gray-500">
                {note.created_at.toLocaleDateString()} {note.created_at.toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            Brak notatek do wyświetlenia
          </div>
        )}

        {/* Add Note Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${colors.modal.container} max-w-lg w-full mx-4 p-6 rounded-xl`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Nowa notatka</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={colors.form.label}>Tytuł</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className={colors.form.input}
                    placeholder="Tytuł notatki"
                  />
                </div>

                <div>
                  <label className={colors.form.label}>Treść</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className={`${colors.form.textarea} h-48`}
                    placeholder="Treść notatki"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleAddNote}
                  className={`${colors.button.primary} px-6 py-2 rounded-lg flex items-center gap-2`}
                >
                  <Save className="w-5 h-5" />
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;