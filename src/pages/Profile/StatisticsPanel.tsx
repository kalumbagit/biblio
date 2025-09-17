// components/StatisticsPanel.tsx
import React from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Users, BookOpen, Calendar, Download } from "lucide-react";

export const StatisticsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Statistiques de la bibliothèque
        </h3>
        <Button variant="outline" className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Exporter</span>
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Prêts ce mois</p>
                <p className="text-3xl font-bold">67</p>
                <p className="text-sm opacity-90 mt-1">+12% vs mois dernier</p>
              </div>
              <BookOpen className="w-8 h-8 opacity-90" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Nouveaux lecteurs</p>
                <p className="text-3xl font-bold">23</p>
                <p className="text-sm opacity-90 mt-1">+8% vs mois dernier</p>
              </div>
              <Users className="w-8 h-8 opacity-90" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Taux de retour</p>
                <p className="text-3xl font-bold">94%</p>
                <p className="text-sm opacity-90 mt-1">Dans les temps</p>
              </div>
              <Calendar className="w-8 h-8 opacity-90" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section graphiques (à implémenter avec recharts si nécessaire) */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Graphiques statistiques</h4>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 text-center">
              Intégration des graphiques avec Recharts
              <br />
              <span className="text-sm">
                (Installation requise: npm install recharts)
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des livres populaires */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Livres les plus populaires</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Livre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prêts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">1984</td>
                  <td className="px-6 py-4 whitespace-nowrap">George Orwell</td>
                  <td className="px-6 py-4 whitespace-nowrap">28</td>
                  <td className="px-6 py-4 whitespace-nowrap">4.8/5</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Le Petit Prince
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Antoine de Saint-Exupéry
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">25</td>
                  <td className="px-6 py-4 whitespace-nowrap">4.9/5</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Harry Potter à l'école des sorciers
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">J.K. Rowling</td>
                  <td className="px-6 py-4 whitespace-nowrap">22</td>
                  <td className="px-6 py-4 whitespace-nowrap">4.7/5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
