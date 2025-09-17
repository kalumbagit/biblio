import React from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  AlertTriangle,
  FileText,
  CreditCard,
  User,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useUserLoans } from "../hooks/useLoans";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { formatDate, isOverdue, getDaysUntilDue } from "../utils/format";

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: loansData } = useUserLoans();

  const loans = loansData?.data || [];
  const activeLoans = loans.filter((loan) => loan.status === "ACTIVE");

  const stats = [
    {
      title: "Prêts actifs",
      value: user?.active_loans_count || 0,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Montant des pénalités impayées",
      value: user?.unpaid_penalities_amount || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Demandes en attente",
      value: 0, // TODO: Get from API
      icon: user?.pending_requests_count || 0,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Total des prêts",
      value: loans.length,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  const quickActions = [
    {
      title: "Rechercher des livres",
      description: "Parcourir le catalogue",
      href: "/books",
      icon: BookOpen,
      color: "bg-blue-600",
    },
    {
      title: "Faire une demande",
      description: "Demander un nouveau prêt",
      href: "/requests/new",
      icon: FileText,
      color: "bg-green-600",
    },
    {
      title: "Mes prêts",
      description: "Voir mes prêts actuels",
      href: "/loans",
      icon: CreditCard,
      color: "bg-purple-600",
    },
    {
      title: "Mon profil",
      description: "Gérer mon compte",
      href: "/profile",
      icon: User,
      color: "bg-indigo-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("dashboard.welcome", { name: user?.first_name })}
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de votre activité de lecture
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.bgColor} mr-4`}>
                  {typeof stat.icon === "function" && (
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Prêts récents
              </h2>
            </CardHeader>
            <CardContent>
              {activeLoans.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun prêt actif</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeLoans.slice(0, 5).map((loan) => {
                    const daysUntilDue = getDaysUntilDue(loan.dueDate);
                    const overdue = isOverdue(loan.dueDate);

                    return (
                      <div
                        key={loan.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {loan.bookStock?.book?.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {loan.bookStock?.book?.authors
                                ?.map((author) => author.full_name)
                                .join(", ")}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                À rendre le {formatDate(loan.dueDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              overdue
                                ? "danger"
                                : daysUntilDue <= 3
                                ? "warning"
                                : "success"
                            }
                            size="sm"
                          >
                            {overdue
                              ? `${Math.abs(daysUntilDue)} jour(s) de retard`
                              : daysUntilDue === 0
                              ? "À rendre aujourd'hui"
                              : `${daysUntilDue} jour(s) restant(s)`}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Actions rapides
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Notifications
              </h2>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">
                  Aucune nouvelle notification
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
