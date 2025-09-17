// AdminDashboard.tsx
import React, { useState } from "react";
import { Users, UserPlus, Settings, BarChart3 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { CreateUserModal } from "./CreateUserModal";
import { Button } from "../../components/ui/Button";
import { UsersManagement } from "./UsersManagement"; 
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/Tabs";
import { StatisticsPanel } from "./StatisticsPanel"; 
import { SettingsPage } from "./SettingsPage";

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto">
      {/* En-tête du dashboard */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard Administrateur
        </h2>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Créer un utilisateur</span>
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Utilisateurs</p>
                <p className="text-3xl font-bold">152</p>
              </div>
              <Users className="w-8 h-8 opacity-90" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Lecteurs Actifs</p>
                <p className="text-3xl font-bold">128</p>
              </div>
              <Users className="w-8 h-8 opacity-90" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Secrétaires</p>
                <p className="text-3xl font-bold">8</p>
              </div>
              <Users className="w-8 h-8 opacity-90" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Prêts en cours</p>
                <p className="text-3xl font-bold">45</p>
              </div>
              <BarChart3 className="w-8 h-8 opacity-90" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation par onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Utilisateurs</span>
          </TabsTrigger>
          <TabsTrigger
            value="statistics"
            className="flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistiques</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Paramètres</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="statistics">
          <StatisticsPanel />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPage />
        </TabsContent>
      </Tabs>

      {/* Modal de création d'utilisateur */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
