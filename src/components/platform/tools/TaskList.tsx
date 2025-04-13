import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Check, X, Clock, Bell } from 'lucide-react';
import { colors } from '../../../config/colors';
import { toast } from 'sonner';
import { auth, db } from '../../../lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  reminders: {
    method: 'email' | 'popup' | 'sms';
    minutes: number;
  }[];
}

function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed'>>({
    title: '',
    description: '',
    dueDate: new Date(),
    reminders: [{ method: 'popup', minutes: 30 }]
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('user_id', '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(tasksQuery);
      const fetchedTasks: Task[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Safely handle dueDate conversion
        let dueDate: Date;
        if (data.dueDate) {
          // Check if dueDate has toDate method (Firestore Timestamp)
          if (typeof data.dueDate.toDate === 'function') {
            dueDate = data.dueDate.toDate();
          } else if (data.dueDate instanceof Date) {
            dueDate = data.dueDate;
          } else {
            // Fallback to current date if dueDate is invalid
            dueDate = new Date();
          }
        } else {
          // Default to current date if dueDate is missing
          dueDate = new Date();
        }
        
        fetchedTasks.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          dueDate: dueDate,
          completed: data.completed,
          reminders: data.reminders || []
        });
      });

      setTasks(fetchedTasks.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime()));
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Nie udało się załadować zadań');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      if (!newTask.title) {
        toast.error('Tytuł zadania jest wymagany');
        return;
      }

      const taskData = {
        ...newTask,
        completed: false,
        user_id: currentUser.uid,
        created_at: Timestamp.now(),
        dueDate: Timestamp.fromDate(newTask.dueDate)
      };

      const docRef = await addDoc(collection(db, 'tasks'), taskData);

      setTasks(prev => [{
        id: docRef.id,
        ...newTask,
        completed: false
      }, ...prev]);

      setShowAddForm(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: new Date(),
        reminders: [{ method: 'popup', minutes: 30 }]
      });

      toast.success('Zadanie dodane');
    } catch (err: any) {
      console.error('Error adding task:', err);
      toast.error('Nie udało się dodać zadania');
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        completed: !task.completed
      });

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Nie udało się zaktualizować zadania');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Zadanie usunięte');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Nie udało się usunąć zadania');
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
          <h1 className="text-2xl font-bold text-white">Lista zadań</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className={`${colors.button.primary} px-4 py-2 rounded-lg flex items-center gap-2`}
          >
            <Plus className="w-5 h-5" />
            Dodaj zadanie
          </button>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${colors.card.stats} p-4 rounded-lg`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    task.completed
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-600'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    task.completed ? 'text-gray-400 line-through' : 'text-white'
                  }`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-gray-400 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {task.dueDate.toLocaleDateString()}
                    </div>
                    {task.reminders.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Bell className="w-4 h-4" />
                        {task.reminders[0].minutes} min przed
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Brak zadań do wyświetlenia
            </div>
          )}
        </div>

        {/* Add Task Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${colors.modal.container} max-w-lg w-full mx-4 p-6 rounded-xl`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Nowe zadanie</h2>
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
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className={colors.form.input}
                    placeholder="Nazwa zadania"
                  />
                </div>

                <div>
                  <label className={colors.form.label}>Opis</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className={`${colors.form.textarea} h-32`}
                    placeholder="Opis zadania"
                  />
                </div>

                <div>
                  <label className={colors.form.label}>Data i godzina</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={newTask.dueDate.toISOString().split('T')[0]}
                        onChange={(e) => {
                          if (e.target.value) {
                            const date = new Date(e.target.value);
                            if (!isNaN(date.getTime())) {
                              // Preserve the time from the existing dueDate
                              const currentTime = newTask.dueDate;
                              date.setHours(currentTime.getHours(), currentTime.getMinutes());
                              setNewTask({ ...newTask, dueDate: date });
                            }
                          }
                        }}
                        className={colors.form.input}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="time"
                        value={`${newTask.dueDate.getHours().toString().padStart(2, '0')}:${newTask.dueDate.getMinutes().toString().padStart(2, '0')}`}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const date = new Date(newTask.dueDate);
                            date.setHours(hours, minutes);
                            setNewTask({ ...newTask, dueDate: date });
                          }
                        }}
                        className={colors.form.input}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={colors.form.label}>Przypomnienia</label>
                  {newTask.reminders.map((reminder, index) => (
                    <div key={index} className="flex items-center gap-2 mt-2">
                      <select
                        value={reminder.method}
                        onChange={(e) => {
                          const newReminders = [...newTask.reminders];
                          newReminders[index].method = e.target.value as 'email' | 'popup' | 'sms';
                          setNewTask({ ...newTask, reminders: newReminders });
                        }}
                        className={colors.form.select}
                      >
                        <option value="popup">Powiadomienie</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                      </select>
                      <input
                        type="number"
                        value={reminder.minutes}
                        onChange={(e) => {
                          const newReminders = [...newTask.reminders];
                          newReminders[index].minutes = parseInt(e.target.value);
                          setNewTask({ ...newTask, reminders: newReminders });
                        }}
                        className={`${colors.form.input} w-24`}
                        min="1"
                        step="5"
                      />
                      <span className="text-gray-400">min</span>
                      {index > 0 && (
                        <button
                          onClick={() => {
                            const newReminders = newTask.reminders.filter((_, i) => i !== index);
                            setNewTask({ ...newTask, reminders: newReminders });
                          }}
                          className="text-red-500 hover:text-red-400"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {newTask.reminders.length < 3 && (
                    <button
                      onClick={() => {
                        setNewTask({
                          ...newTask,
                          reminders: [...newTask.reminders, { method: 'popup', minutes: 30 }]
                        });
                      }}
                      className="text-blue-400 hover:text-blue-300 mt-2 text-sm"
                    >
                      + Dodaj przypomnienie
                    </button>
                  )}
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
                  onClick={handleAddTask}
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

export default TaskList;