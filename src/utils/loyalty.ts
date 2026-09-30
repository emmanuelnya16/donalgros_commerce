import { type OrderResponse } from '../services/catalogueService';
import { type Order } from '../context/AppContext';

// ─── CONFIGURATION DU PROGRAMME DE FIDÉLITÉ ─────────────────────────────────

/**
 * Règle de calcul : 1 000 FCFA = 10 points (soit 1 pt pour 100 FCFA dépensés)
 */
export const POINTS_PER_FCFA = 0.01; // 10 points / 1 000 FCFA

export interface GiftMilestone {
  id: string;
  pointsRequired: number;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  rewardValueLabel: string;
  iconName: 'gift' | 'trophy' | 'crown' | 'sparkles';
  badgeColor: string;
}

export const GIFT_MILESTONES: GiftMilestone[] = [
  {
    id: 'milestone-1000',
    pointsRequired: 1000,
    titleFr: 'Cadeau Découverte Donald Gros',
    titleEn: 'Donald Gros Discovery Gift',
    descriptionFr: 'Pack d’accessoires surprises ou bon de réduction immédiat en magasin.',
    descriptionEn: 'Surprise accessory pack or immediate discount voucher in-store.',
    rewardValueLabel: 'Valeur ~5 000 FCFA',
    iconName: 'gift',
    badgeColor: 'from-amber-500 to-amber-700',
  },
  {
    id: 'milestone-2500',
    pointsRequired: 2500,
    titleFr: 'Cadeau Privilège Silver',
    titleEn: 'Silver Privilege Gift',
    descriptionFr: 'Article de mode de choix ou article électro au choix dans la sélection cadeaux boutique.',
    descriptionEn: 'Selected fashion item or home appliance gift choice in-store.',
    rewardValueLabel: 'Valeur ~15 000 FCFA',
    iconName: 'trophy',
    badgeColor: 'from-slate-400 to-slate-600',
  },
  {
    id: 'milestone-5000',
    pointsRequired: 5000,
    titleFr: 'Cadeau VIP Gold Excellence',
    titleEn: 'Gold Excellence VIP Gift',
    descriptionFr: 'Pack Premium prestige (appareil électroménager ou tenue complète de marque) remis en mains propres.',
    descriptionEn: 'Prestige VIP bundle (home appliance or designer outfit) handed in person.',
    rewardValueLabel: 'Valeur ~35 000 FCFA',
    iconName: 'crown',
    badgeColor: 'from-yellow-400 to-amber-600',
  },
  {
    id: 'milestone-10000',
    pointsRequired: 10000,
    titleFr: 'Cadeau Prestige Platine Ambassadeur',
    titleEn: 'Platinum Ambassador Prestige Gift',
    descriptionFr: 'Récompense d’exception réservée à nos plus grands clients + invitation événements VIP.',
    descriptionEn: 'Exceptional reward reserved for our top clients + VIP event invitation.',
    rewardValueLabel: 'Valeur ~75 000 FCFA',
    iconName: 'sparkles',
    badgeColor: 'from-purple-500 to-indigo-700',
  },
];

export interface LoyaltyProfile {
  totalPoints: number;
  eligibleOrdersCount: number;
  tier: {
    nameFr: string;
    nameEn: string;
    level: 'Bronze' | 'Silver' | 'Gold' | 'Platine';
    color: string;
    gradient: string;
  };
  nextMilestone: GiftMilestone | null;
  pointsToNextMilestone: number;
  progressPercentage: number;
  unlockedMilestones: GiftMilestone[];
  orderPointsMap: Record<string, number>;
}

// ─── FONCTIONS DE CALCUL ────────────────────────────────────────────────────

/**
 * Calcule les points gagnés pour un montant donné en FCFA
 */
export function calculateOrderPoints(amount: number): number {
  if (!amount || amount <= 0) return 0;
  return Math.floor(amount * POINTS_PER_FCFA);
}

/**
 * Détermine si un statut de commande est éligible pour les points
 */
export function isOrderEligibleForPoints(status: string): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase().trim();
  
  // Statuts d'échec ou d'annulation
  const excluded = [
    'cancelled',
    'canceled',
    'annulée',
    'annulee',
    'payment_failed',
    'failed',
    'échoué',
    'echoue',
    'refunded',
    'remboursé'
  ];

  if (excluded.some(ex => normalized.includes(ex))) {
    return false;
  }

  // Statuts éligibles (validées, payées, en traitement, expédiées, livrées)
  return true;
}

/**
 * Détermine le rang VIP en fonction du solde de points
 */
export function getLoyaltyTier(points: number) {
  if (points >= 10000) {
    return {
      nameFr: 'Membre Platine Ambassadeur',
      nameEn: 'Platinum Ambassador Member',
      level: 'Platine' as const,
      color: 'text-purple-600',
      gradient: 'from-purple-600 via-indigo-600 to-blue-700',
    };
  }
  if (points >= 5000) {
    return {
      nameFr: 'Membre VIP Gold',
      nameEn: 'VIP Gold Member',
      level: 'Gold' as const,
      color: 'text-amber-500',
      gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    };
  }
  if (points >= 2500) {
    return {
      nameFr: 'Membre Silver',
      nameEn: 'Silver Member',
      level: 'Silver' as const,
      color: 'text-slate-400',
      gradient: 'from-slate-400 via-gray-500 to-slate-600',
    };
  }
  return {
    nameFr: 'Membre Bronze',
    nameEn: 'Bronze Member',
    level: 'Bronze' as const,
    color: 'text-amber-700',
    gradient: 'from-amber-700 via-orange-700 to-amber-900',
  };
}

/**
 * Analyse l'historique des commandes (API ou Context local) et génère le profil fidélité complet
 */
export function calculateLoyaltyProfile(
  apiOrders: OrderResponse[] = [],
  localOrders: Order[] = []
): LoyaltyProfile {
  let totalPoints = 0;
  let eligibleOrdersCount = 0;
  const orderPointsMap: Record<string, number> = {};

  // Traiter les commandes API en priorité si existantes
  if (apiOrders && apiOrders.length > 0) {
    apiOrders.forEach(ord => {
      if (isOrderEligibleForPoints(ord.status)) {
        const pts = calculateOrderPoints(ord.totalAmount);
        totalPoints += pts;
        eligibleOrdersCount += 1;
        orderPointsMap[String(ord.id)] = pts;
        orderPointsMap[ord.orderNumber] = pts;
      }
    });
  } else if (localOrders && localOrders.length > 0) {
    localOrders.forEach(ord => {
      if (isOrderEligibleForPoints(ord.status)) {
        const pts = calculateOrderPoints(ord.total);
        totalPoints += pts;
        eligibleOrdersCount += 1;
        orderPointsMap[String(ord.id)] = pts;
      }
    });
  }

  // Déterminer le prochain palier cadeau et les paliers débloqués
  const unlockedMilestones = GIFT_MILESTONES.filter(m => totalPoints >= m.pointsRequired);
  const nextMilestone = GIFT_MILESTONES.find(m => totalPoints < m.pointsRequired) || null;

  let progressPercentage = 100;
  let pointsToNextMilestone = 0;

  if (nextMilestone) {
    const prevRequired = unlockedMilestones.length > 0 
      ? unlockedMilestones[unlockedMilestones.length - 1].pointsRequired 
      : 0;
    
    const range = nextMilestone.pointsRequired - prevRequired;
    const progressInRange = totalPoints - prevRequired;
    progressPercentage = Math.min(100, Math.max(0, Math.round((progressInRange / range) * 100)));
    pointsToNextMilestone = nextMilestone.pointsRequired - totalPoints;
  }

  const tier = getLoyaltyTier(totalPoints);

  return {
    totalPoints,
    eligibleOrdersCount,
    tier,
    nextMilestone,
    pointsToNextMilestone,
    progressPercentage,
    unlockedMilestones,
    orderPointsMap,
  };
}
