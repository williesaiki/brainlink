import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mail, Phone, MapPin, Briefcase, Calendar, Save } from 'lucide-react';
import { userProfileService } from '../../services/userProfileService';
import { colors } from '../../config/colors';
import { auth } from '../../lib/firebase';
import { toast } from 'sonner';

function Profile() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    specialization: '',
    experience: '',
    photoURL: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await userProfileService.getProfile();
      if (profile) {
        setFormData({
          fullName: profile.displayName,
          email: profile.email,
          phone: profile.phone || '',
          location: profile.location || '',
          specialization: profile.role || '',
          experience: profile.bio || '',
          photoURL: profile.photoURL || 'https://via.placeholder.com/150'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      await userProfileService.updateProfile({
        displayName: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        role: formData.specialization,
        bio: formData.experience
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const photoURL = await userProfileService.uploadProfilePhoto(file);
        setFormData(prev => ({ ...prev, photoURL }));
        loadUserProfile();
        toast.success('Photo uploaded successfully');
      } catch (error) {
        console.error('Error uploading photo:', error);
        toast.error('Failed to upload photo');
      } finally {
        setIsUploading(false);
      }
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
        <h1 className="text-2xl font-bold text-white mb-6">Twój Profil</h1>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${colors.card.stats} rounded-xl p-6`}
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={formData.photoURL}
                  alt="Profile"
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <label className={`absolute bottom-2 right-2 ${colors.button.secondary} p-2 rounded-lg cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">{formData.fullName}</h2>
                <p className="text-gray-400">Agent Premium</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${colors.card.stats} rounded-xl p-6`}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Informacje osobiste</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={colors.form.label}>Imię i nazwisko</label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={colors.form.input}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={colors.form.label}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${colors.form.input} pl-10`}
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={colors.form.label}>Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${colors.form.input} pl-10`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={colors.form.label}>Lokalizacja</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`${colors.form.input} pl-10`}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${colors.card.stats} rounded-xl p-6`}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Informacje zawodowe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={colors.form.label}>Specjalizacja</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={`${colors.form.input} pl-10`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={colors.form.label}>Doświadczenie</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`${colors.form.input} pl-10`}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className={`${colors.button.primary} w-full py-3 font-medium ${
              showSuccess ? 'login-success' : ''
            }`}
          >
            <Save className="w-5 h-5 inline-block mr-2" />
            {showSuccess ? 'Zapisano!' : 'Zapisz zmiany'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default Profile;