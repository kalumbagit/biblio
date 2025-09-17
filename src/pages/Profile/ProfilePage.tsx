// ProfilePage.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { ReaderProfile } from './ReaderProfile'; 
import { SecretaryProfile } from './SecretaryProfile'; 
import { AdminDashboard } from './AdminDashboard'; 
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Non authentifié
          </h2>
          <p className="text-gray-600">
            Veuillez vous connecter pour accéder à votre profil.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion du Profil
          </h1>
          <p className="text-gray-600">
            {user.role === UserRole.ADMIN 
              ? "Tableau de bord d'administration" 
              : "Gérez vos informations personnelles"
            }
          </p>
        </div>

        {/* Contenu selon le rôle */}
        {user.role === UserRole.READER && <ReaderProfile user={user} />}
        {user.role === UserRole.SECRETARY && <SecretaryProfile user={user} />}
        {user.role === UserRole.ADMIN && <AdminDashboard />}
      </div>
    </div>
  );
};