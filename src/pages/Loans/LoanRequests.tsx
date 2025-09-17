// LoanRequests.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  Search,
  Eye,
  FileText,
  Calendar,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../components/ui/Dialog";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types";
import { Modal } from "../../components/ui/Modal";
import { Textarea } from "../../components/ui/Textarea";

// Types pour les demandes de prêt
export enum LoanStatus {
  PENDING = "En attente",
  APPROVED = "Approuvé",
  REJECTED = "Rejeté",
  IN_REVIEW = "En cours d'analyse",
}

export interface LoanRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  amount: number;
  duration: number; // en mois
  purpose: string;
  status: LoanStatus;
  submission_date: string;
  review_date?: string;
  reviewed_by?: string;
  comments?: string;
}

// Types pour l'utilisateur
export interface AppUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone?: string;
}

// Données mockées - à remplacer par un appel API
const mockLoanRequests: LoanRequest[] = [
  {
    id: "1",
    user_id: "1",
    user_name: "Jean Dupont",
    user_email: "jean.dupont@email.com",
    amount: 15000,
    duration: 24,
    purpose: "Achat de voiture",
    status: LoanStatus.APPROVED,
    submission_date: "2023-10-15",
    review_date: "2023-10-18",
    reviewed_by: "Admin1",
    comments: "Dossier complet, revenus stables",
  },
  {
    id: "2",
    user_id: "2",
    user_name: "Marie Martin",
    user_email: "marie.martin@email.com",
    amount: 35000,
    duration: 180,
    purpose: "Achat immobilier",
    status: LoanStatus.PENDING,
    submission_date: "2023-10-20",
  },
  {
    id: "3",
    user_id: "1", // Même utilisateur que la première demande
    user_name: "Jean Dupont",
    user_email: "jean.dupont@email.com",
    amount: 8000,
    duration: 12,
    purpose: "Travaux de rénovation",
    status: LoanStatus.REJECTED,
    submission_date: "2023-10-05",
    review_date: "2023-10-10",
    reviewed_by: "Admin2",
    comments: "Ratio d'endettement trop élevé",
  },
  {
    id: "4",
    user_id: "4",
    user_name: "Sophie Dubois",
    user_email: "sophie.dubois@email.com",
    amount: 12000,
    duration: 36,
    purpose: "Création d'entreprise",
    status: LoanStatus.IN_REVIEW,
    submission_date: "2023-10-22",
    review_date: "2023-10-23",
    reviewed_by: "Admin1",
    comments: "Business plan en cours d'analyse",
  },
];

export const LoanRequests: React.FC = () => {
  const { user } = useAuth();
  const [isLoanModalOpen, setLoanModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LoanStatus | "all">("all");
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [userRequests, setUserRequests] = useState<LoanRequest[]>([]);

  // Filtrer les demandes selon l'utilisateur connecté
  useEffect(() => {
    if (user) {
      if (user.role === UserRole.ADMIN) {
        // Les admins voient toutes les demandes
        setUserRequests(mockLoanRequests);
      } else {
        // Les utilisateurs normaux ne voient que leurs demandes
        const filtered = mockLoanRequests.filter(
          (request) => request.user_id === user.id
        );
        setUserRequests(filtered);
      }
    } else {
      // Si l'utilisateur n'est pas connecté, vider les demandes
      setUserRequests([]);
    }
  }, [user]);

  const filteredRequests = userRequests.filter((request) => {
    const matchesSearch = `${request.user_name} ${request.purpose}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.APPROVED:
        return "success";
      case LoanStatus.REJECTED:
        return "danger";
      case LoanStatus.IN_REVIEW:
        return "warning";
      case LoanStatus.PENDING:
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.APPROVED:
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case LoanStatus.REJECTED:
        return <XCircle className="w-4 h-4 mr-1" />;
      case LoanStatus.IN_REVIEW:
        return <Clock className="w-4 h-4 mr-1" />;
      case LoanStatus.PENDING:
        return <AlertCircle className="w-4 h-4 mr-1" />;
      default:
        return <FileText className="w-4 h-4 mr-1" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const handleViewDetails = (request: LoanRequest) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  // Statistiques pour l'utilisateur connecté
  const userStats = {
    total: userRequests.length,
    pending: userRequests.filter((r) => r.status === LoanStatus.PENDING).length,
    approved: userRequests.filter((r) => r.status === LoanStatus.APPROVED).length,
    rejected: userRequests.filter((r) => r.status === LoanStatus.REJECTED).length,
    inReview: userRequests.filter((r) => r.status === LoanStatus.IN_REVIEW).length,
  };

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      
      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={isAdmin ? "Rechercher une demande..." : "Rechercher dans mes demandes..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as LoanStatus | "all")}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value={LoanStatus.PENDING}>En attente</option>
              <option value={LoanStatus.IN_REVIEW}>En cours d'analyse</option>
              <option value={LoanStatus.APPROVED}>Approuvées</option>
              <option value={LoanStatus.REJECTED}>Rejetées</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="mt-4 mb-6 mx-3 sm:mx-5 md:mx-8 lg:mx-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Total des demandes</p>
                <p className="text-2xl font-bold">{userStats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600">En attente</p>
                <p className="text-2xl font-bold">{userStats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">Approuvées</p>
                <p className="text-2xl font-bold">{userStats.approved}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center">
              <div className="rounded-full bg-red-100 p-3 mr-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600">Rejetées</p>
                <p className="text-2xl font-bold">{userStats.rejected}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="grid gap-4">
        {filteredRequests.map((request) => (
          <Card
            key={request.id}
            className="hover:shadow-md transition-shadow duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {request.user_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    {isAdmin && (
                      <h4 className="font-semibold">{request.user_name}</h4>
                    )}
                    <div className="flex items-center mt-1">
                      <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-gray-700 font-medium">
                        {formatCurrency(request.amount)}
                      </span>
                      <span className="mx-2 text-gray-400">•</span>
                      <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-gray-600">
                        {request.duration} mois
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {request.purpose}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge
                      variant={getStatusBadgeVariant(request.status)}
                      className="flex items-center"
                    >
                      {getStatusIcon(request.status)}
                      {request.status}
                    </Badge>
                    <p className="text-gray-500 text-sm mt-1">
                      Déposée le {formatDate(request.submission_date)}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(request)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Détails
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              {isAdmin
                ? "Aucune demande de prêt trouvée"
                : "Vous n'avez aucune demande de prêt"}
            </p>
            {!isAdmin && userRequests.length === 0 && (
              <Button 
                className="mt-4" 
                onClick={() => setLoanModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Faire une demande de prêt
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de demande de prêt */}
      <Modal
        isOpen={isLoanModalOpen}
        onClose={() => setLoanModalOpen(false)}
        title="Demande de prêt"
        animation="slideIn"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // envoyer la demande ici
            setLoanModalOpen(false);
            alert("Demande de prêt envoyée !");
          }}
          className="space-y-4"
        >
          <Input
            label="Nom complet"
            value={`${user?.first_name || ""} ${user?.last_name || ""}`.trim() || ""}
            required
            disabled
          />
          <Input
            label="Email"
            type="email"
            value={user?.email || ""}
            required
            disabled
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Date de début" type="date" required />
            <Input label="Date de retour" type="date" required />
          </div>
          
          <Input
            label="Montant"
            type="number"
            min="1"
            required
          />
          
          <Input
            label="Durée (mois)"
            type="number"
            min="1"
            required
          />
          
          <Textarea 
            label="Objet du prêt" 
            placeholder="Décrivez l'utilisation prévue du prêt"
            required
          />
          
          <Textarea label="Remarque (optionnel)" />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLoanModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Envoyer la demande</Button>
          </div>
        </form>
      </Modal>

      {/* Dialogue de détails */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande de prêt</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande sélectionnée
            </DialogDescription>
            <DialogClose onClick={() => setIsDetailDialogOpen(false)} />
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {selectedRequest.user_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  {isAdmin && (
                    <>
                      <h3 className="text-lg font-semibold">
                        {selectedRequest.user_name}
                      </h3>
                      <p className="text-gray-600">
                        {selectedRequest.user_email}
                      </p>
                    </>
                  )}
                  <Badge
                    variant={getStatusBadgeVariant(selectedRequest.status)}
                    className="mt-2 flex items-center"
                  >
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Informations financières
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Montant demandé:</span>
                        <span className="font-semibold">
                          {formatCurrency(selectedRequest.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Durée:</span>
                        <span className="font-semibold">
                          {selectedRequest.duration} mois
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Dates importantes
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">
                          Date de soumission:
                        </span>
                        <span className="font-semibold">
                          {formatDate(selectedRequest.submission_date)}
                        </span>
                      </div>
                      {selectedRequest.review_date && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">
                            Date de traitement:
                          </span>
                          <span className="font-semibold">
                            {formatDate(selectedRequest.review_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Objet du prêt
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md h-28">
                      <p className="text-gray-800">{selectedRequest.purpose}</p>
                    </div>
                  </div>

                  {selectedRequest.reviewed_by && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Traitée par
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-gray-800">
                          {selectedRequest.reviewed_by}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.comments && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Commentaires
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-800">{selectedRequest.comments}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Fermer
            </Button>
            {isAdmin && selectedRequest?.status === LoanStatus.PENDING && (
              <Button>Traiter la demande</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};