export interface Ninja {
  id?: number;
  username: string;
  rank: 'Genin' | 'Chunin' | 'Jonin' | 'Kage';
  password?: string;
  passwordHash?: string;
  avatarUrl?: string;
  experiencePoints?: number;
}

export interface Mission {
  id: string | number;
  title: string;
  description: string;
  rankRequirement: 'D' | 'C' | 'B' | 'A' | 'S';
  reward: number;
  status: 'DISPONIBLE' | 'EN_CURSO' | 'COMPLETADA';
  assignedTo?: number | string;
  acceptedByNinjaName?: string;
  acceptedByNinjaAvatar?: string;
  img?: string;
}

export interface AuthResponse {
  token: string;
  ninja: Ninja;
}

export interface Stats {
  completedMissions: number;
  xp: number;
  currentRank: string;
}