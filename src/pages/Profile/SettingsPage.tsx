// pages/settings/SettingsPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Save, Clock, AlertCircle, BookOpen, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('loan-settings');
  const [isLoading, setIsLoading] = useState(false);

  // États pour les paramètres
  const [loanSettings, setLoanSettings] = useState({
    loanDuration: 14,
    renewalDuration: 7,
    maxRenewals: 2,
    reservationDuration: 48,
  });

  const [penaltySettings, setPenaltySettings] = useState({
    dailyPenalty: 0.50,
    gracePeriod: 3,
    maxPenalty: 20,
    suspensionDays: 7,
  });

  const [systemSettings, setSystemSettings] = useState({
    maxBooksPerUser: 5,
    maxReservations: 3,
    autoRenewal: false,
    notificationsEnabled: true,
  });

  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Accès restreint
            </h2>
            <p className="text-red-600">
              Seuls les administrateurs peuvent accéder aux paramètres système.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true);
    try {
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Paramètres ${section} sauvegardés avec succès !`);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des paramètres: '+error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Paramètres Système
        </h1>
        <p className="text-gray-600">
          Configurez les paramètres de la bibliothèque et gérez les règles de prêt
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8">
          <TabsTrigger value="loan-settings" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Prêts</span>
          </TabsTrigger>
          <TabsTrigger value="penalty-settings" className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Pénalités</span>
          </TabsTrigger>
          <TabsTrigger value="system-settings" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Système</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Paramètres de prêt */}
        <TabsContent value="loan-settings">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Paramètres de prêt</span>
                </h2>
                <Button
                  onClick={() => handleSaveSettings('de prêt')}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Durée du prêt (jours)"
                  type="number"
                  min="1"
                  max="30"
                  value={loanSettings.loanDuration}
                  onChange={(e) => setLoanSettings({
                    ...loanSettings,
                    loanDuration: parseInt(e.target.value)
                  })}
                  helper="Nombre de jours pour un prêt standard"
                />

                <Input
                  label="Durée de renouvellement (jours)"
                  type="number"
                  min="1"
                  max="14"
                  value={loanSettings.renewalDuration}
                  onChange={(e) => setLoanSettings({
                    ...loanSettings,
                    renewalDuration: parseInt(e.target.value)
                  })}
                  helper="Durée supplémentaire lors d'un renouvellement"
                />

                <Input
                  label="Renouvellements maximum"
                  type="number"
                  min="0"
                  max="5"
                  value={loanSettings.maxRenewals}
                  onChange={(e) => setLoanSettings({
                    ...loanSettings,
                    maxRenewals: parseInt(e.target.value)
                  })}
                  helper="Nombre maximum de renouvellements autorisés"
                />

                <Input
                  label="Durée de réservation (heures)"
                  type="number"
                  min="24"
                  max="168"
                  value={loanSettings.reservationDuration}
                  onChange={(e) => setLoanSettings({
                    ...loanSettings,
                    reservationDuration: parseInt(e.target.value)
                  })}
                  helper="Temps pour récupérer un livre réservé"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres de pénalités */}
        <TabsContent value="penalty-settings">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Paramètres de pénalités</span>
                </h2>
                <Button
                  onClick={() => handleSaveSettings('de pénalités')}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Pénalité quotidienne (€)"
                  type="number"
                  step="0.10"
                  min="0"
                  max="5"
                  value={penaltySettings.dailyPenalty}
                  onChange={(e) => setPenaltySettings({
                    ...penaltySettings,
                    dailyPenalty: parseFloat(e.target.value)
                  })}
                  helper="Montant par jour de retard"
                />

                <Input
                  label="Période de grâce (jours)"
                  type="number"
                  min="0"
                  max="7"
                  value={penaltySettings.gracePeriod}
                  onChange={(e) => setPenaltySettings({
                    ...penaltySettings,
                    gracePeriod: parseInt(e.target.value)
                  })}
                  helper="Jours sans pénalité après la date de retour"
                />

                <Input
                  label="Pénalité maximale (€)"
                  type="number"
                  min="0"
                  max="100"
                  value={penaltySettings.maxPenalty}
                  onChange={(e) => setPenaltySettings({
                    ...penaltySettings,
                    maxPenalty: parseFloat(e.target.value)
                  })}
                  helper="Plafond des pénalités par livre"
                />

                <Input
                  label="Jours de suspension"
                  type="number"
                  min="0"
                  max="30"
                  value={penaltySettings.suspensionDays}
                  onChange={(e) => setPenaltySettings({
                    ...penaltySettings,
                    suspensionDays: parseInt(e.target.value)
                  })}
                  helper="Suspension en cas de non-retour"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres système */}
        <TabsContent value="system-settings">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Paramètres système</span>
                </h2>
                <Button
                  onClick={() => handleSaveSettings('système')}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Livres maximum par utilisateur"
                  type="number"
                  min="1"
                  max="10"
                  value={systemSettings.maxBooksPerUser}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    maxBooksPerUser: parseInt(e.target.value)
                  })}
                  helper="Nombre maximum de livres empruntables simultanément"
                />

                <Input
                  label="Réservations maximum"
                  type="number"
                  min="1"
                  max="5"
                  value={systemSettings.maxReservations}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    maxReservations: parseInt(e.target.value)
                  })}
                  helper="Nombre maximum de réservations simultanées"
                />

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={systemSettings.autoRenewal}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        autoRenewal: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Renouvellement automatique
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Renouveler automatiquement les prêts si le livre n'est pas réservé
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres de notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Paramètres de notifications</span>
                </h2>
                <Button
                  onClick={() => handleSaveSettings('de notifications')}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </Button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Rappels par email</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Rappel avant expiration</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Notification de retard</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Disponibilité de réservation</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Notifications push</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Activées</span>
                      <input
                        type="checkbox"
                        defaultChecked={systemSettings.notificationsEnabled}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          notificationsEnabled: e.target.checked
                        })}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};