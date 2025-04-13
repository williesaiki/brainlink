import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Tag,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  MapPin,
  Save,
  X,
  Upload,
  RefreshCw
} from 'lucide-react';
import { colors } from '../../config/colors';
import { toast } from 'sonner';

interface Draft {
  id: string;
  name: string;
  status: 'Szkic' | 'W trakcie' | 'Gotowe do przeglądu';
  tags: string[];
  modified: string;
  description?: string;
  location?: string;
  area?: number;
  rooms?: number;
  price?: number;
  category: 'Sprzedaż' | 'Wynajem';
  images: string[];
  notes?: string;
  checklist: { id: string; task: string; completed: boolean }[];
}

// Mock data
const mockDrafts: Draft[] = [
  {
    id: '1',
    name: 'Mieszkanie – Warszawa, ul. Marszałkowska 10',
    status: 'Szkic',
    tags: ['#sprzedaż', '#pilne'],
    modified: '2025-03-08',
    location: 'Warszawa, ul. Marszałkowska 10',
    area: 75,
    rooms: 3,
    price: 850000,
    category: 'Sprzedaż',
    images: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?auto=format&fit=crop&q=80'
    ],
    notes: 'Świetna lokalizacja, wymaga odświeżenia',
    checklist: [
      { id: '1', task: 'Dodaj zdjęcia', completed: true },
      { id: '2', task: 'Zweryfikuj cenę', completed: false }
    ]
  },
  {
    id: '2',
    name: 'Dom – Kraków, ul. Wiosenna 5',
    status: 'W trakcie',
    tags: ['#wynajem', '#duży'],
    modified: '2025-03-07',
    location: 'Kraków, ul. Wiosenna 5',
    area: 150,
    rooms: 5,
    price: 1200000,
    category: 'Sprzedaż',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'
    ],
    notes: 'Duży ogród, garaż na dwa samochody',
    checklist: [
      { id: '1', task: 'Dodaj więcej zdjęć', completed: false },
      { id: '2', task: 'Przygotuj opis', completed: true }
    ]
  },
  {
    id: '3',
    name: 'Apartament – Gdańsk, ul. Morska 22',
    status: 'Gotowe do przeglądu',
    tags: ['#premium'],
    modified: '2025-03-09',
    location: 'Gdańsk, ul. Morska 22',
    area: 100,
    rooms: 4,
    price: 950000,
    category: 'Wynajem',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80'
    ],
    notes: 'Widok na morze, wysoki standard',
    checklist: [
      { id: '1', task: 'Sprawdź dokumenty', completed: true },
      { id: '2', task: 'Zrób zdjęcia wieczorem', completed: false }
    ]
  }
];

function Workspace() {
  const [drafts, setDrafts] = useState<Draft[]>(mockDrafts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'tags'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = (type: 'date' | 'name' | 'tags') => {
    if (sortBy === type) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedDrafts = drafts
    .filter(draft => 
      draft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.modified).getTime() - new Date(b.modified).getTime()
          : new Date(b.modified).getTime() - new Date(a.modified).getTime();
      } else if (sortBy === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortDirection === 'asc'
          ? a.tags.length - b.tags.length
          : b.tags.length - a.tags.length;
      }
    });

  const handleCreateDraft = () => {
    const newDraft: Draft = {
      id: (drafts.length + 1).toString(),
      name: 'Nowa wersja robocza',
      status: 'Szkic',
      tags: [],
      modified: new Date().toISOString(),
      category: 'Sprzedaż',
      images: [],
      checklist: [
        { id: '1', task: 'Dodaj podstawowe informacje', completed: false },
        { id: '2', task: 'Dodaj zdjęcia', completed: false },
        { id: '3', task: 'Przygotuj opis', completed: false }
      ]
    };
    setDrafts([newDraft, ...drafts]);
    setSelectedDraft(newDraft);
  };

  const handleSaveDraft = (draft: Draft) => {
    setDrafts(drafts.map(d => d.id === draft.id ? draft : d));
    toast.success('Zapisano wersję roboczą');
  };

  const handleDeleteDraft = (id: string) => {
    setDrafts(drafts.filter(d => d.id !== id));
    setSelectedDraft(null);
    toast.success('Usunięto wersję roboczą');
  };

  const handleGenerateAIDescription = async () => {
    if (!selectedDraft) return;
    
    setIsLoading(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiDescription = `Przedstawiam Państwu wyjątkową nieruchomość zlokalizowaną w ${selectedDraft.location}. 
        Ta przestronna posiadłość o powierzchni ${selectedDraft.area}m² składa się z ${selectedDraft.rooms} pokoi.
        ${selectedDraft.category === 'Sprzedaż' ? 'Cena sprzedaży wynosi' : 'Cena wynajmu wynosi'} ${selectedDraft.price?.toLocaleString()} PLN.
        ${selectedDraft.notes || ''}`;
      
      setSelectedDraft({
        ...selectedDraft,
        description: aiDescription
      });
      
      toast.success('Wygenerowano opis AI');
    } catch (error) {
      toast.error('Nie udało się wygenerować opisu');
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedDraft) {
    return (
      <div className="p-8 bg-[#000008] min-h-screen">
        <div className="w-full">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setSelectedDraft(null)}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ChevronDown className="w-5 h-5" />
              Powrót do listy
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => handleDeleteDraft(selectedDraft.id)}
                className={`${colors.button.secondary} text-red-500 hover:text-red-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-2`}
              >
                <Trash2 className="w-5 h-5" />
                Usuń
              </button>
              <button
                onClick={() => handleSaveDraft(selectedDraft)}
                className={`${colors.button.primary} px-6 py-2 rounded-lg transition-colors flex items-center gap-2`}
              >
                <Save className="w-5 h-5" />
                Zapisz
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              {/* Basic Information */}
              <div className={`${colors.card.stats} rounded-xl p-6`}>
                <h3 className="text-xl font-semibold text-white mb-6">Podstawowe informacje</h3>
                <div className="space-y-4">
                  <div>
                    <label className={colors.form.label}>Nazwa</label>
                    <input
                      type="text"
                      value={selectedDraft.name}
                      onChange={(e) => setSelectedDraft({ ...selectedDraft, name: e.target.value })}
                      className={colors.form.input}
                    />
                  </div>
                  <div>
                    <label className={colors.form.label}>Status</label>
                    <select
                      value={selectedDraft.status}
                      onChange={(e) => setSelectedDraft({ ...selectedDraft, status: e.target.value as Draft['status'] })}
                      className={colors.form.select}
                    >
                      <option value="Szkic">Szkic</option>
                      <option value="W trakcie">W trakcie</option>
                      <option value="Gotowe do przeglądu">Gotowe do przeglądu</option>
                    </select>
                  </div>
                  <div>
                    <label className={colors.form.label}>Kategoria</label>
                    <select
                      value={selectedDraft.category}
                      onChange={(e) => setSelectedDraft({ ...selectedDraft, category: e.target.value as Draft['category'] })}
                      className={colors.form.select}
                    >
                      <option value="Sprzedaż">Sprzedaż</option>
                      <option value="Wynajem">Wynajem</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className={`${colors.card.stats} rounded-xl p-6`}>
                <h3 className="text-xl font-semibold text-white mb-6">Szczegóły nieruchomości</h3>
                <div className="space-y-4">
                  <div>
                    <label className={colors.form.label}>Lokalizacja</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={selectedDraft.location}
                        onChange={(e) => setSelectedDraft({ ...selectedDraft, location: e.target.value })}
                        className={`${colors.form.input} pl-10`}
                        placeholder="Adres nieruchomości"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={colors.form.label}>Powierzchnia (m²)</label>
                      <input
                        type="number"
                        value={selectedDraft.area}
                        onChange={(e) => setSelectedDraft({ ...selectedDraft, area: parseFloat(e.target.value) })}
                        className={colors.form.input}
                      />
                    </div>
                    <div>
                      <label className={colors.form.label}>Liczba pokoi</label>
                      <input
                        type="number"
                        value={selectedDraft.rooms}
                        onChange={(e) => setSelectedDraft({ ...selectedDraft, rooms: parseInt(e.target.value) })}
                        className={colors.form.input}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={colors.form.label}>Cena (PLN)</label>
                    <input
                      type="number"
                      value={selectedDraft.price}
                      onChange={(e) => setSelectedDraft({ ...selectedDraft, price: parseFloat(e.target.value) })}
                      className={colors.form.input}
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className={`${colors.card.stats} rounded-xl p-6`}>
                <h3 className="text-xl font-semibold text-white mb-6">Zdjęcia</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {selectedDraft.images.map((image, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden">
                      <img src={image} alt="" className="w-full h-48 object-cover" />
                      <button
                        onClick={() => setSelectedDraft({
                          ...selectedDraft,
                          images: selectedDraft.images.filter((_, i) => i !== index)
                        })}
                        className="absolute top-2 right-2 bg-red-500 p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center items-center h-48 border-2 border-dashed border-gray-600 rounded-lg">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Przeciągnij zdjęcia lub kliknij, aby dodać</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Description */}
              <div className={`${colors.card.stats} rounded-xl p-6`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Opis oferty</h3>
                  <button
                    onClick={handleGenerateAIDescription}
                    disabled={isLoading}
                    className={`${colors.button.secondary} px-4 py-2 rounded-lg transition-colors flex items-center gap-2`}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Edit3 className="w-5 h-5" />
                        Generuj z AI
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={selectedDraft.description}
                  onChange={(e) => setSelectedDraft({ ...selectedDraft, description: e.target.value })}
                  className={`${colors.form.textarea} w-full min-h-[200px]`}
                  placeholder="Wprowadź opis nieruchomości..."
                />
              </div>

              {/* Notes */}
              <div className={`${colors.card.stats} rounded-xl p-6`}>
                <h3 className="text-xl font-semibold text-white mb-6">Notatki</h3>
                <textarea
                  value={selectedDraft.notes}
                  onChange={(e) => setSelectedDraft({ ...selectedDraft, notes: e.target.value })}
                  className={`${colors.form.textarea} w-full min-h-[150px]`}
                  placeholder="Dodaj swoje notatki..."
                />
              </div>

              {/* Checklist */}
              <div className={`${colors.card.stats} rounded-xl p-6`}>
                <h3 className="text-xl font-semibold text-white mb-6">Lista zadań</h3>
                <div className="space-y-4">
                  {selectedDraft.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {
                          setSelectedDraft({
                            ...selectedDraft,
                            checklist: selectedDraft.checklist.map(task =>
                              task.id === item.id ? { ...task, completed: !task.completed } : task
                            )
                          });
                        }}
                        className="form-checkbox h-5 w-5 text-gray-400"
                      />
                      <span className={`text-gray-400 ${item.completed ? 'line-through' : ''}`}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Stanowisko robocze</h1>
          <button
            onClick={handleCreateDraft}
            className={`${colors.button.primary} px-6 py-2 rounded-lg transition-colors flex items-center gap-2`}
          >
            <Plus className="w-5 h-5" />
            Nowa wersja robocza
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Szukaj wersji roboczych..."
              className={`w-full ${colors.form.search} py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500`}
            />
          </div>
          <button
            onClick={() => handleSort('tags')}
            className={`${colors.button.secondary} px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap`}
          >
            <Filter className="w-5 h-5" />
            Sortuj po tagach
            {sortBy === 'tags' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
          </button>
        </div>

        <div className={`${colors.card.stats} rounded-xl overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#010220]">
                <th className="text-left py-4 px-6 text-gray-400 font-medium">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2"
                  >
                    Nazwa
                    {sortBy === 'name' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </button>
                </th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium w-[150px]">Status</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Tagi</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium w-[250px]">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-2"
                  >
                    Data modyfikacji
                    {sortBy === 'date' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedDrafts.map((draft) => (
                <tr
                  key={draft.id}
                  onClick={() => setSelectedDraft(draft)}
                  className="border-b border-[#010220] hover:bg-[#010220]/50 cursor-pointer transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Edit3 className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{draft.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="w-[120px]">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        draft.status === 'Szkic'
                          ? 'bg-gray-500/20 text-gray-400'
                          : draft.status === 'W trakcie'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-green-500/20 text-green-400'
                      }`}>
                        {draft.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      {draft.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-[#010220] text-gray-400 px-2 py-1 rounded-lg text-sm flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(draft.modified).toLocaleDateString()}</span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{new Date(draft.modified).toLocaleTimeString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Workspace;