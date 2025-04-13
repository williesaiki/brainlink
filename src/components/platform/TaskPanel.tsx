import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Target, 
  CheckCircle2, 
  X, 
  Calendar, 
  Clock, 
  Bell,
  Save,
  Building2,
  Edit,
  Trash2
} from 'lucide-react';
import { colors } from '../../config/colors';
import { calendarService, ReminderSettings } from '../../services/calendarService';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  isCompleted: boolean;
  reminders: ReminderSettings[];
  calendarEventId?: string;
}

interface TaskPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaskPanel({ isOpen, onClose }: TaskPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Spotkanie z klientem - ul. Marszałkowska',
      description: 'Omówienie szczegółów oferty',
      dueDate: new Date(),
      isCompleted: false,
      reminders: [{ method: 'popup', minutes: 30 }],
      calendarEventId: 'event1'
    },
    {
      id: '2',
      title: 'Przygotować ofertę dla Jana Kowalskiego',
      description: 'Przygotowanie dokumentacji',
      dueDate: new Date(),
      isCompleted: false,
      reminders: [{ method: 'popup', minutes: 30 }],
      calendarEventId: 'event2'
    }
  ]);

  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: new Date(),
    reminders: [{ method: 'popup', minutes: 30 }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.dueDate) {
      toast.error('Wypełnij wymagane pola');
      return;
    }

    setIsSubmitting(true);

    try {
      const event = await calendarService.createEvent({
        title: newTask.title,
        description: newTask.description || '',
        startDate: newTask.dueDate,
        endDate: new Date(newTask.dueDate.getTime() + 60 * 60 * 1000),
        reminders: newTask.reminders || []
      });

      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        isCompleted: false,
        reminders: newTask.reminders || [],
        calendarEventId: event.id
      };

      setTasks(prev => [...prev, task]);
      setIsAddPanelOpen(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: new Date(),
        reminders: [{ method: 'popup', minutes: 30 }]
      });
      toast.success('Zadanie dodane do kalendarza');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Nie udało się utworzyć zadania');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !selectedTask.title || !selectedTask.dueDate) {
      toast.error('Wypełnij wymagane pola');
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedTask.calendarEventId) {
        await calendarService.createEvent({
          title: selectedTask.title,
          description: selectedTask.description || '',
          startDate: selectedTask.dueDate,
          endDate: new Date(selectedTask.dueDate.getTime() + 60 * 60 * 1000),
          reminders: selectedTask.reminders
        });
      }

      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id ? selectedTask : task
      ));
      setIsEditing(false);
      setSelectedTask(null);
      toast.success('Zadanie zaktualizowane');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Nie udało się zaktualizować zadania');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      if (task.calendarEventId) {
        // Add calendar event deletion here when API supports it
      }

      setTasks(prev => prev.filter(t => t.id !== task.id));
      setSelectedTask(null);
      setIsEditing(false);
      toast.success('Zadanie usunięte');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Nie udało się usunąć zadania');
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditing(false);
  };

  const addReminder = () => {
    if (isEditing && selectedTask) {
      setSelectedTask({
        ...selectedTask,
        reminders: [...selectedTask.reminders, { method: 'popup', minutes: 30 }]
      });
    } else {
      setNewTask(prev => ({
        ...prev,
        reminders: [...(prev.reminders || []), { method: 'popup', minutes: 30 }]
      }));
    }
  };

  const removeReminder = (index: number) => {
    if (isEditing && selectedTask) {
      setSelectedTask({
        ...selectedTask,
        reminders: selectedTask.reminders.filter((_, i) => i !== index)
      });
    } else {
      setNewTask(prev => ({
        ...prev,
        reminders: prev.reminders?.filter((_, i) => i !== index)
      }));
    }
  };

  const updateReminder = (index: number, field: keyof ReminderSettings, value: string | number) => {
    if (isEditing && selectedTask) {
      setSelectedTask({
        ...selectedTask,
        reminders: selectedTask.reminders.map((reminder, i) =>
          i === index
            ? { ...reminder, [field]: field === 'minutes' ? Number(value) : value }
            : reminder
        )
      });
    } else {
      setNewTask(prev => ({
        ...prev,
        reminders: prev.reminders?.map((reminder, i) =>
          i === index
            ? { ...reminder, [field]: field === 'minutes' ? Number(value) : value }
            : reminder
        )
      }));
    }
  };

  const renderTaskForm = (task: Partial<Task>, isNew: boolean) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Tytuł zadania
          </label>
          <input
            type="text"
            value={task.title}
            onChange={(e) => isEditing 
              ? setSelectedTask({ ...selectedTask!, title: e.target.value })
              : setNewTask({ ...newTask, title: e.target.value })
            }
            className="w-full bg-[#010220] border border-gray-800 rounded-lg px-4 py-2 text-white"
            placeholder="Nazwa zadania"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Opis
          </label>
          <textarea
            value={task.description}
            onChange={(e) => isEditing
              ? setSelectedTask({ ...selectedTask!, description: e.target.value })
              : setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full bg-[#010220] border border-gray-800 rounded-lg px-4 py-2 text-white h-24 resize-none"
            placeholder="Opis zadania"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Data i godzina
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={task.dueDate?.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (isEditing) {
                    setSelectedTask({ ...selectedTask!, dueDate: newDate });
                  } else {
                    setNewTask({ ...newTask, dueDate: newDate });
                  }
                }}
                className="w-full bg-[#010220] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white"
              />
            </div>
            <div className="relative flex-1">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="time"
                value={task.dueDate?.toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newDate = new Date(task.dueDate || new Date());
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  if (isEditing) {
                    setSelectedTask({ ...selectedTask!, dueDate: newDate });
                  } else {
                    setNewTask({ ...newTask, dueDate: newDate });
                  }
                }}
                className="w-full bg-[#010220] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-400">
              Przypomnienia
            </label>
            <button
              onClick={addReminder}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Dodaj przypomnienie
            </button>
          </div>
          <div className="space-y-3">
            {(isEditing ? selectedTask?.reminders : task.reminders)?.map((reminder, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Bell className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={reminder.method}
                    onChange={(e) => updateReminder(index, 'method', e.target.value)}
                    className="w-full bg-[#010220] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white appearance-none"
                  >
                    <option value="popup">Powiadomienie</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <input
                  type="number"
                  value={reminder.minutes}
                  onChange={(e) => updateReminder(index, 'minutes', e.target.value)}
                  className="w-24 bg-[#010220] border border-gray-800 rounded-lg px-3 py-2 text-white"
                  min="0"
                  step="5"
                />
                <span className="text-gray-400 text-sm">min</span>
                {index > 0 && (
                  <button
                    onClick={() => removeReminder(index)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => isNew ? setIsAddPanelOpen(false) : setIsEditing(false)}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Anuluj
        </button>
        {isEditing && selectedTask && (
          <button
            onClick={() => handleDeleteTask(selectedTask)}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Usuń
          </button>
        )}
        <button
          onClick={isEditing ? handleUpdateTask : handleAddTask}
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEditing ? 'Zapisz zmiany' : 'Zapisz'}
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderTaskDetails = (task: Task) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">{task.title}</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-[#010220] hover:bg-[#010220]/80 text-white p-2 rounded-lg transition-colors"
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      {task.description && (
        <div className="bg-[#010220] rounded-lg p-4">
          <p className="text-gray-400">{task.description}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#010220] rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Calendar className="w-5 h-5" />
            <span>Data</span>
          </div>
          <span className="text-white">
            {task.dueDate.toLocaleDateString()}
          </span>
        </div>

        <div className="bg-[#010220] rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Clock className="w-5 h-5" />
            <span>Godzina</span>
          </div>
          <span className="text-white">
            {task.dueDate.toLocaleTimeString().slice(0, 5)}
          </span>
        </div>
      </div>

      <div className="bg-[#010220] rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <Bell className="w-5 h-5" />
          <span>Przypomnienia</span>
        </div>
        <div className="space-y-2">
          {task.reminders.map((reminder, index) => (
            <div key={index} className="flex items-center justify-between text-gray-400">
              <span>{reminder.method === 'popup' ? 'Powiadomienie' : reminder.method}</span>
              <span>{reminder.minutes} min przed</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setSelectedTask(null)}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Zamknij
        </button>
        <button
          onClick={() => handleDeleteTask(task)}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          Usuń
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Main Panel Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Add Task Panel Overlay */}
      {isAddPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsAddPanelOpen(false)}
        />
      )}

      {/* Main Task Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-96 z-50 transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          bg-[#000008] border-l border-[#E5E5E5]/10`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#010220] transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#010220]">
                <Building2 className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Lista zadań</h3>
                <p className="text-sm text-gray-400">Zarządzaj swoimi zadaniami</p>
              </div>
            </div>
            {!selectedTask && (
              <button
                onClick={() => setIsAddPanelOpen(true)}
                className="bg-[#010220] hover:bg-[#010220]/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Dodaj
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedTask ? (
              isEditing ? (
                renderTaskForm(selectedTask, false)
              ) : (
                renderTaskDetails(selectedTask)
              )
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <h4 className="text-sm font-medium text-gray-300">Zadania</h4>
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#010220] hover:bg-[#010220]/80 transition-colors"
                    >
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskCompletion(task.id);
                        }}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          task.isCompleted 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-600'
                        }`}
                      >
                        {task.isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className={`flex-1 text-left ${
                        task.isCompleted 
                          ? 'text-gray-400 line-through' 
                          : 'text-white'
                      }`}>
                        {task.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-96 z-60 transform transition-transform duration-300
          ${isAddPanelOpen ? 'translate-x-0' : 'translate-x-full'}
          bg-[#000008] border-l border-[#E5E5E5]/10`}
      >
        <button
          onClick={() => setIsAddPanelOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#010220] transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 h-full flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Nowe zadanie</h3>
          {renderTaskForm(newTask, true)}
        </div>
      </div>
    </>
  );
}