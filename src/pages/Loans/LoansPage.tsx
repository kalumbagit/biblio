import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import {
  Search,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Filter,
  Eye,
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
import { UserRole } from "../../types";

// Types pour les prêts
export enum LoanStatus {
  ACTIVE = "Actif",
  RETURNED = "Retourné",
  LATE = "En retard",
  PENDING = "En attente",
}

// Ajoutez ces interfaces pour les nouvelles statistiques
interface PenaltyStats {
  totalPenalties: number;
  paidPenalties: number;
  unpaidPenalties: number;
}

interface TimePeriod {
  value: "week" | "month";
  label: string;
}

export interface Loan {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  itemId: string;
  itemName: string;
  itemCategory: string;
  loanDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: LoanStatus;
  lateDays?: number;
  fineAmount?: number;
  comments?: string;
  approvedBy?: string;
}

// Types pour l'utilisateur
export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
}

// Données mockées - à remplacer par un appel API
const mockLoans: Loan[] = [
  {
    id: "1",
    userId: "1",
    userName: "Jean Dupont",
    userEmail: "jean.dupont@email.com",
    itemId: "ITM-001",
    itemName: "Ordinateur Portable Dell XPS 15",
    itemCategory: "Informatique",
    loanDate: "2023-10-01",
    expectedReturnDate: "2023-10-15",
    actualReturnDate: "2023-10-14",
    status: LoanStatus.RETURNED,
    comments: "RAS",
  },
  {
    id: "2",
    userId: "2",
    userName: "Marie Martin",
    userEmail: "marie.martin@email.com",
    itemId: "ITM-002",
    itemName: "Projecteur Epson EB-U05",
    itemCategory: "Audiovisuel",
    loanDate: "2023-10-10",
    expectedReturnDate: "2023-10-17",
    status: LoanStatus.ACTIVE,
    approvedBy: "Admin1",
  },
  {
    id: "3",
    userId: "1",
    userName: "Jean Dupont",
    userEmail: "jean.dupont@email.com",
    itemId: "ITM-003",
    itemName: "Appareil Photo Canon EOS R6",
    itemCategory: "Photographie",
    loanDate: "2023-10-05",
    expectedReturnDate: "2023-10-12",
    status: LoanStatus.LATE,
    lateDays: 3,
    fineAmount: 15,
    comments: "Relance effectuée le 15/10",
  },
  {
    id: "4",
    userId: "3",
    userName: "Pierre Leroy",
    userEmail: "pierre.leroy@email.com",
    itemId: "ITM-004",
    itemName: "Caméra GoPro Hero 9",
    itemCategory: "Photographie",
    loanDate: "2023-10-18",
    expectedReturnDate: "2023-10-25",
    status: LoanStatus.PENDING,
    comments: "En attente de validation",
  },
  {
    id: "5",
    userId: "4",
    userName: "Sophie Dubois",
    userEmail: "sophie.dubois@email.com",
    itemId: "ITM-005",
    itemName: "Microphone Rode NT-USB",
    itemCategory: "Audiovisuel",
    loanDate: "2023-09-20",
    expectedReturnDate: "2023-09-27",
    actualReturnDate: "2023-09-26",
    status: LoanStatus.RETURNED,
    comments: "Matériel en parfait état",
  },
];


export const LoansPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LoanStatus | "all">(
    "all"
  );
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Ajoutez cet état dans votre composant LoansPage
  const [timePeriod, setTimePeriod] = useState<TimePeriod>({
    value: "week",
    label: "Cette semaine",
  });
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [penaltyStats, setPenaltyStats] = useState<PenaltyStats>({
    totalPenalties: 245,
    paidPenalties: 180,
    unpaidPenalties: 65,
  });

  // Fonction pour changer la période
  const handleTimePeriodChange = (period: "week" | "month") => {
    setTimePeriod({
      value: period,
      label: period === "week" ? "Cette semaine" : "Ce mois",
    });
    // Ici vous pourriez recharger les données en fonction de la période
  };

  const isAdmin =
    user?.role === UserRole.ADMIN || user?.role === UserRole.SECRETARY;

  // Filtrer les prêts selon l'utilisateur connecté
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        // Les admins voient tous les prêts
        setUserLoans(mockLoans);
      } else {
        // Les utilisateurs normaux ne voient que leurs prêts
        const filtered = mockLoans.filter((loan) => loan.userId === user.id);
        setUserLoans(filtered);
      }
    }
  }, [user, isAdmin]);

  const filteredLoans = userLoans.filter((loan) => {
    const matchesSearch =
      `${loan.userName} ${loan.itemName} ${loan.itemCategory}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || loan.status === selectedStatus;

    const matchesCategory =
      categoryFilter === "all" || loan.itemCategory === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadgeVariant = (
    status: LoanStatus
  ): "default" | "success" | "outline" | "danger" | "warning" | "info" => {
    switch (status) {
      case LoanStatus.ACTIVE:
        return "default";
      case LoanStatus.RETURNED:
        return "success";
      case LoanStatus.LATE:
        return "danger"; // ✅ au lieu de "destructive"
      case LoanStatus.PENDING:
        return "warning"; // ✅ au lieu de "secondary"
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.ACTIVE:
        return <Clock className="w-4 h-4 mr-1" />;
      case LoanStatus.RETURNED:
        return <i className="fas fa-check-circle mr-1"></i>;
      case LoanStatus.LATE:
        return <AlertCircle className="w-4 h-4 mr-1" />;
      case LoanStatus.PENDING:
        return <Clock className="w-4 h-4 mr-1" />;
      default:
        return <i className="fas fa-file-alt mr-1"></i>;
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

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDetailDialogOpen(true);
  };

  // Statistiques pour l'utilisateur connecté
  const userStats = {
    total: userLoans.length,
    active: userLoans.filter((loan) => loan.status === LoanStatus.ACTIVE)
      .length,
    returned: userLoans.filter((loan) => loan.status === LoanStatus.RETURNED)
      .length,
    late: userLoans.filter((loan) => loan.status === LoanStatus.LATE).length,
    pending: userLoans.filter((loan) => loan.status === LoanStatus.PENDING)
      .length,
  };

  // Catégories uniques pour le filtre
  const categories = [...new Set(userLoans.map((loan) => loan.itemCategory))];

  return (
    <div className="space-y-6">
      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={
                    isAdmin
                      ? "Rechercher un prêt..."
                      : "Rechercher dans mes prêts..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as LoanStatus | "all")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value={LoanStatus.ACTIVE}>Actifs</option>
                    <option value={LoanStatus.RETURNED}>Retournés</option>
                    <option value={LoanStatus.LATE}>En retard</option>
                    <option value={LoanStatus.PENDING}>En attente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="space-y-4 mt-4 mb-6 mx-3 sm:mx-5 md:mx-8 lg:mx-12">
        {/* Sélecteur de période */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Statistiques des prêts</h3>
          <div className="flex space-x-2">
            <Button
              variant={timePeriod.value === "week" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleTimePeriodChange("week")}
            >
              Semaine
            </Button>
            <Button
              variant={timePeriod.value === "month" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleTimePeriodChange("month")}
            >
              Mois
            </Button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {/* Total des prêts */}
          <Card className="bg-blue-50 border-blue-200 overflow-hidden">
            <CardContent className="p-3 flex items-center">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <i className="fas fa-list-alt text-blue-600 text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-600 truncate">
                  Total des prêts
                </p>
                <p className="text-xl font-bold truncate">{userStats.total}</p>
                <p className="text-xs text-gray-500 truncate">
                  {timePeriod.label}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Prêts retournés */}
          <Card className="bg-green-50 border-green-200 overflow-hidden">
            <CardContent className="p-3 flex items-center">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <i className="fas fa-check-circle text-green-600 text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-600 truncate">Retournés</p>
                <p className="text-xl font-bold truncate">
                  {userStats.returned}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {timePeriod.label}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Prêts actifs */}
          <Card className="bg-orange-50 border-orange-200 overflow-hidden">
            <CardContent className="p-3 flex items-center">
              <div className="rounded-full bg-orange-100 p-2 mr-3">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-orange-600 truncate">Actifs</p>
                <p className="text-xl font-bold truncate">{userStats.active}</p>
                <p className="text-xs text-gray-500 truncate">
                  {timePeriod.label}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Prêts en retard */}
          <Card className="bg-red-50 border-red-200 overflow-hidden">
            <CardContent className="p-3 flex items-center">
              <div className="rounded-full bg-red-100 p-2 mr-3">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-red-600 truncate">En retard</p>
                <p className="text-xl font-bold truncate">{userStats.late}</p>
                <p className="text-xs text-gray-500 truncate">
                  {timePeriod.label}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total des pénalités */}
          <Card className="bg-purple-50 border-purple-200 overflow-hidden">
            <CardContent className="p-3 flex items-center">
              <div className="rounded-full bg-purple-100 p-2 mr-3">
                <i className="fas fa-exclamation-triangle text-purple-600 text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-purple-600 truncate">
                  Total pénalités
                </p>
                <p className="text-xl font-bold truncate">
                  {formatCurrency(penaltyStats.totalPenalties)}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {timePeriod.label}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pénalités payées */}
          <Card className="bg-teal-50 border-teal-200 overflow-hidden">
            <CardContent className="p-3 flex items-center">
              <div className="rounded-full bg-teal-100 p-2 mr-3">
                <i className="fas fa-check-circle text-teal-600 text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-teal-600 truncate">
                  Pénalités payées
                </p>
                <p className="text-xl font-bold truncate">
                  {formatCurrency(penaltyStats.paidPenalties)}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-teal-600 h-1.5 rounded-full"
                    style={{
                      width: `${
                        (penaltyStats.paidPenalties /
                          penaltyStats.totalPenalties) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pénalités impayées */}
          <Card className="bg-amber-50 border-amber-200 overflow-hidden">
            <CardContent className="p-3 flex items-center">
              <div className="rounded-full bg-amber-100 p-2 mr-3">
                <i className="fas fa-times-circle text-amber-600 text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-600 truncate">
                  Pénalités impayées
                </p>
                <p className="text-xl font-bold truncate">
                  {formatCurrency(penaltyStats.unpaidPenalties)}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-amber-600 h-1.5 rounded-full"
                    style={{
                      width: `${
                        (penaltyStats.unpaidPenalties /
                          penaltyStats.totalPenalties) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Taux de retour */}
          <Card className="bg-indigo-50 border-indigo-200 overflow-hidden">
            <CardContent className="p-3 flex items-center">
              <div className="rounded-full bg-indigo-100 p-2 mr-3">
                <i className="fas fa-chart-line text-indigo-600 text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-indigo-600 truncate">
                  Taux de retour
                </p>
                <p className="text-xl font-bold truncate">
                  {userStats.total > 0
                    ? `${Math.round(
                        (userStats.returned / userStats.total) * 100
                      )}%`
                    : "0%"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {timePeriod.label}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tableau des prêts */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Utilisateur</TableHead>}
                <TableHead>Équipement</TableHead>
                <TableHead className="hidden md:table-cell">
                  Catégorie
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Date d'emprunt
                </TableHead>
                <TableHead>Retour prévu</TableHead>
                <TableHead>Statut</TableHead>
                {isAdmin && (
                  <TableHead className="hidden xl:table-cell">
                    Jours de retard
                  </TableHead>
                )}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => (
                <TableRow key={loan.id} className="hover:bg-gray-50">
                  {isAdmin && (
                    <TableCell data-header="Utilisateur">
                      <div>
                        <div className="font-medium">{loan.userName}</div>
                        <div className="text-sm text-gray-500">
                          {loan.userEmail}
                        </div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell data-header="Équipement">
                    <div className="font-medium">{loan.itemName}</div>
                    <div className="text-sm text-gray-500 md:hidden">
                      {loan.itemId}
                    </div>
                  </TableCell>
                  <TableCell
                    data-header="Catégorie"
                    className="hidden md:table-cell"
                  >
                    {loan.itemCategory}
                  </TableCell>
                  <TableCell
                    data-header="Date d'emprunt"
                    className="hidden lg:table-cell"
                  >
                    {formatDate(loan.loanDate)}
                  </TableCell>
                  <TableCell data-header="Retour prévu">
                    <div>{formatDate(loan.expectedReturnDate)}</div>
                    {loan.status === LoanStatus.LATE && (
                      <div className="text-sm text-red-600 md:hidden">
                        {loan.lateDays} jour(s) de retard
                      </div>
                    )}
                  </TableCell>
                  <TableCell data-header="Statut">
                    <Badge
                      variant={getStatusBadgeVariant(loan.status)}
                      className="flex items-center w-min"
                    >
                      {getStatusIcon(loan.status)}
                      {loan.status}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell
                      data-header="Jours de retard"
                      className="hidden xl:table-cell"
                    >
                      {loan.lateDays ? `${loan.lateDays} jour(s)` : "-"}
                    </TableCell>
                  )}
                  <TableCell className="text-right" data-header="Actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(loan)}
                      className="w-full md:w-auto justify-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="md:sr-only">Détails</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Version mobile card layout (alternative) */}
          <div className="md:hidden mt-4 space-y-4">
            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                className="bg-white p-4 rounded-lg shadow-sm border"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{loan.itemName}</h3>
                    <p className="text-sm text-gray-500">{loan.itemId}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(loan.status)}>
                    {getStatusIcon(loan.status)}
                    {loan.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Catégorie</p>
                    <p>{loan.itemCategory}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Emprunté le</p>
                    <p>{formatDate(loan.loanDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Retour prévu</p>
                    <p>{formatDate(loan.expectedReturnDate)}</p>
                  </div>
                  {isAdmin && (
                    <div>
                      <p className="text-gray-500">Utilisateur</p>
                      <p>{loan.userName}</p>
                    </div>
                  )}
                </div>

                {loan.status === LoanStatus.LATE && (
                  <div className="mt-3 p-2 bg-red-50 rounded-md">
                    <p className="text-red-600 text-sm">
                      {loan.lateDays} jour(s) de retard
                      {loan.fineAmount > 0 &&
                        ` • Amende: ${formatCurrency(loan.fineAmount)}`}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(loan)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Détails
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredLoans.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {isAdmin ? "Aucun prêt trouvé" : "Vous n'avez aucun prêt"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Dialogue de détails */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du prêt</DialogTitle>
            <DialogDescription>
              Informations complètes sur le prêt sélectionné
            </DialogDescription>
            <DialogClose onClick={() => setIsDetailDialogOpen(false)} />
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {selectedLoan.userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  {isAdmin && (
                    <>
                      <h3 className="text-lg font-semibold">
                        {selectedLoan.userName}
                      </h3>
                      <p className="text-gray-600">{selectedLoan.userEmail}</p>
                    </>
                  )}
                  <Badge
                    variant={getStatusBadgeVariant(selectedLoan.status)}
                    className="mt-2 flex items-center w-min"
                  >
                    {getStatusIcon(selectedLoan.status)}
                    {selectedLoan.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <i className="fas fa-box-open mr-2"></i>
                      Informations sur l'équipement
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Équipement:</span>
                        <span className="font-semibold">
                          {selectedLoan.itemName}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Référence:</span>
                        <span className="font-semibold">
                          {selectedLoan.itemId}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Catégorie:</span>
                        <span className="font-semibold">
                          {selectedLoan.itemCategory}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedLoan.lateDays > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                        Retard
                      </h4>
                      <div className="bg-red-50 p-4 rounded-md">
                        <div className="flex justify-between py-2">
                          <span className="text-red-600">Jours de retard:</span>
                          <span className="font-semibold text-red-600">
                            {selectedLoan.lateDays}
                          </span>
                        </div>
                        {selectedLoan.fineAmount > 0 && (
                          <div className="flex justify-between py-2">
                            <span className="text-red-600">
                              Montant de l'amende:
                            </span>
                            <span className="font-semibold text-red-600">
                              {formatCurrency(selectedLoan.fineAmount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Dates importantes
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Date d'emprunt:</span>
                        <span className="font-semibold">
                          {formatDate(selectedLoan.loanDate)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Retour prévu:</span>
                        <span className="font-semibold">
                          {formatDate(selectedLoan.expectedReturnDate)}
                        </span>
                      </div>
                      {selectedLoan.actualReturnDate && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">
                            Retour effectif:
                          </span>
                          <span className="font-semibold">
                            {formatDate(selectedLoan.actualReturnDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedLoan.approvedBy && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Validé par
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-gray-800">
                          {selectedLoan.approvedBy}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedLoan.comments && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Commentaires
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-800">{selectedLoan.comments}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex flex-wrap gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Fermer
            </Button>
            {isAdmin && selectedLoan?.status === LoanStatus.ACTIVE && (
              <Button variant="outline">Marquer comme retourné</Button>
            )}
            {isAdmin && selectedLoan?.status === LoanStatus.PENDING && (
              <>
                <Button variant="outline">Refuser</Button>
                <Button>Approuver</Button>
              </>
            )}
            {!isAdmin && selectedLoan?.status === LoanStatus.ACTIVE && (
              <Button>Demander une prolongation</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
