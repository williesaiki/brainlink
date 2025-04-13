import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail, Phone, Building2, Edit, Save, X, AlertTriangle, UserMinus, StickyNote } from 'lucide-react';
import { Client } from '../../lib/firebase';
import { clientsService } from '../../lib/clientsService';
import { toast } from 'sonner';
import { colors } from '../../config/colors';
import { auth } from '../../lib/firebase';

function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Partial<Client>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const data = await clientsService.getClient(id);
      if (data) {
        setClient(data);
        setEditedClient(data);
        // Check if current user is the owner of this client
        const currentUser = auth.currentUser;
        setIsOwner(currentUser?.uid === data.user_id);
      } else {
        setError('Nie znaleziono klienta');
      }
    } catch (err: any) {
      setError(`Błąd: ${err.message}`);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!client || !editedClient) return;

    try {
      const updatedClient = await clientsService.updateClient(client.id, editedClient);
      setClient(updatedClient);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Błąd podczas aktualizacji:', err);
      toast.error('Nie udało się zapisać zmian');
    }
  };

  const handleDelete = async () => {
    if (!client) return;

    try {
      await clientsService.deleteClient(client.id);
      toast.success('Klient został usunięty');
      
      if (client.client_type === 'buyer') {
        navigate('/platform/clients/buying');
      } else if (client.client_type === 'seller') {
        navigate('/platform/clients/selling');
      } else {
        navigate('/platform/clients/database');
      }
    } catch (err: any) {
      console.error('Błąd podczas usuwania:', err);
      toast.error('Nie udało się usunąć klienta');
    }
  };

  const handleBack = () => {
    // Determine the correct path based on where we came from
    if (client?.client_type === 'buyer') {
      navigate('/platform/clients/buying');
    } else if (client?.client_type === 'seller') {
      navigate('/platform/clients/selling');
    } else {
      navigate('/platform/clients/database');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-[#000008] min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-gray-400 text-lg"
        >
          Ładowanie...
        </motion.div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-8 bg-[#000008] min-h-screen">
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
          {error || 'Nie znaleziono klienta'}
        </div>
        <button
          onClick={handleBack}
          className="mt-4 inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Powrót do listy klientów
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#000008] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-white transition-colors flex items-center"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Powrót do listy klientów
          </button>
          <div className="flex gap-2">
            {!isOwner && (
              <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-lg text-sm flex items-center">
                Tylko podgląd
              </div>
            )}
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedClient(client);
                  }}
                  className={`${colors.button.secondary} p-2 rounded-lg`}
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  className={`${colors.button.primary} px-4 py-2 rounded-lg flex items-center gap-2`}
                >
                  <Save className="w-5 h-5" />
                  Zapisz
                </button>
              </>
            ) : isOwner && (
              <>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className={`${colors.button.secondary} text-red-500 hover:text-red-400 p-2 rounded-lg transition-colors`}
                >
                  <UserMinus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`${colors.button.secondary} p-2 rounded-lg`}
                >
                  <Edit className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className={`${colors.card.stats} rounded-xl p-6`}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`${colors.effects.active} p-4 rounded-full`}>
              <Building2 className={`w-8 h-8 ${colors.icon.primary}`} />
            </div>
            {isEditing ? (
              <div className="flex-1 space-y-4">
                <div>
                  <label className={colors.form.label}>Imię</label>
                  <input
                    type="text"
                    value={editedClient.first_name || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, first_name: e.target.value })}
                    className={colors.form.input}
                    placeholder="Imię"
                  />
                </div>
                <div>
                  <label className={colors.form.label}>Nazwisko</label>
                  <input
                    type="text"
                    value={editedClient.last_name || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, last_name: e.target.value })}
                    className={colors.form.input}
                    placeholder="Nazwisko"
                  />
                </div>
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-white">
                {client.first_name} {client.last_name}
              </h1>
            )}
          </div>

          <div className="space-y-6">
            <div className={`${colors.card.stats} p-6 rounded-lg`}>
              <h3 className="text-lg font-semibold text-white mb-4">Dane kontaktowe</h3>
              <div className="space-y-4">
                <div>
                  <label className={colors.form.label}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedClient.email || ''}
                        onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                        className={`${colors.form.input} pl-10`}
                        placeholder="Email"
                      />
                    ) : (
                      <div className={`${colors.form.input} pl-10 flex items-center`}>
                        {client.email || 'Brak adresu email'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className={colors.form.label}>Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedClient.phone || ''}
                        onChange={(e) => setEditedClient({ ...editedClient, phone: e.target.value })}
                        className={`${colors.form.input} pl-10`}
                        placeholder="Telefon"
                      />
                    ) : (
                      <div className={`${colors.form.input} pl-10 flex items-center`}>
                        {client.phone || 'Brak numeru telefonu'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${colors.card.stats} p-6 rounded-lg`}>
              <h3 className="text-lg font-semibold text-white mb-4">Notatki</h3>
              <div className="relative">
                <StickyNote className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                {isEditing ? (
                  <textarea
                    value={editedClient.notes || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, notes: e.target.value })}
                    className={`${colors.form.textarea} pl-10 min-h-[120px]`}
                    placeholder="Notatki"
                  />
                ) : (
                  <div className={`${colors.form.input} pl-10 min-h-[120px] whitespace-pre-wrap`}>
                    {client.notes || 'Brak notatek'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${colors.modal.container} max-w-md w-full mx-4 p-6 rounded-xl`}>
              <div className="flex items-center gap-2 text-red-500 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Usuń klienta</h2>
              </div>
              <p className="text-gray-400 mb-6">
                Czy na pewno chcesz usunąć tego klienta? Tej operacji nie można cofnąć.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className={`${colors.button.secondary} px-4 py-2 rounded-lg`}
                >
                  Anuluj
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDetails;