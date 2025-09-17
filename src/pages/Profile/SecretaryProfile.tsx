// SecretaryProfile.tsx
import React, { useState } from 'react';
import { User } from '../../types';
import { ReaderProfile } from './ReaderProfile';
import { Card, CardContent } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'; 
import { UserPlus, Users, BookOpen } from 'lucide-react';

interface SecretaryProfileProps {
  user: User;
}

export const SecretaryProfile: React.FC<SecretaryProfileProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Mon Profil</span>
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Gestion des prêts</span>
          </TabsTrigger>
          <TabsTrigger value="readers" className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Lecteurs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ReaderProfile user={user} />
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Gestion des prêts</h3>
              <p className="text-gray-600">Interface de gestion des prêts à implémenter...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readers">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Gestion des lecteurs</h3>
              <p className="text-gray-600">Interface de gestion des lecteurs à implémenter...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};