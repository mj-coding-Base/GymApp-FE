export enum EquipmentType {
  // Free weights
  DUMBBELL = 'dumbbell',
  BARBELL = 'barbell',
  KETTLEBELL = 'kettlebell',
  PLATE = 'plate',
  EZ_BAR = 'ez_bar',
  WEIGHT_STACK = 'weight_stack',

  // Machines
  SMITH_MACHINE = 'smith_machine',
  CABLE_MACHINE = 'cable_machine',
  LEG_PRESS_MACHINE = 'leg_press_machine',
  CHEST_PRESS_MACHINE = 'chest_press_machine',
  LAT_PULLDOWN_MACHINE = 'lat_pulldown_machine',
  LEG_EXTENSION_MACHINE = 'leg_extension_machine',
  LEG_CURL_MACHINE = 'leg_curl_machine',
  PEC_DECK_MACHINE = 'pec_deck_machine',
  ROWING_MACHINE = 'rowing_machine',

  // Benches & racks
  FLAT_BENCH = 'flat_bench',
  INCLINE_BENCH = 'incline_bench',
  DECLINE_BENCH = 'decline_bench',
  POWER_RACK = 'power_rack',
  SQUAT_RACK = 'squat_rack',

  // Cardio
  TREADMILL = 'treadmill',
  STATIONARY_BIKE = 'stationary_bike',
  ELLIPTICAL = 'elliptical',
  STAIR_CLIMBER = 'stair_climber',
  ROWING_ERG = 'rowing_erg',
  SPIN_BIKE = 'spin_bike',

  // Bodyweight & functional
  PULLUP_BAR = 'pullup_bar',
  DIP_STATION = 'dip_station',
  PARALLEL_BARS = 'parallel_bars',
  RESISTANCE_BAND = 'resistance_band',
  MEDICINE_BALL = 'medicine_ball',
  BOSU_BALL = 'bosu_ball',
  BALANCE_BOARD = 'balance_board',
  SANDBAG = 'sandbag',
  SLAM_BALL = 'slam_ball',

  // Misc / accessories
  MAT = 'mat',
  FOAM_ROLLER = 'foam_roller',
  JUMP_ROPE = 'jump_rope',
  ANKLE_WEIGHT = 'ankle_weight',
  GYM_RING = 'gym_ring',
  SUSPENSION_TRAINER = 'suspension_trainer',
  UNKNOWN = 'unknown'
}

export enum EquipmentStatus {
  AVAILABLE = 'available',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired'
}

export interface Location {
  room?: string;
  zone?: string;
}

export interface Warranty {
  provider?: string;
  expiresAt?: string;
}

export type Equipment = {
  _id?: string;
  equipmentId: string;
  gymId: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  equipmentType: EquipmentType;
  equName: string;
  model?: string;
  brand?: string;
  location?: Location;
  purchaseDate?: string;
  quantityTotal?: number;
  lastServicedAt?: string;
  nextServiceDue?: string;
  warranty?: Warranty;
  equipmentStatus: EquipmentStatus;
  images?: string[];
  cost?: number;
  description?: string;
};

export interface CreateEquipmentDto {
  equipmentType: EquipmentType;
  equName: string;
  model?: string;
  brand?: string;
  location?: Location;
  purchaseDate?: string;
  quantityTotal?: number;
  lastServicedAt?: string;
  nextServiceDue?: string;
  warranty?: Warranty;
  equipmentStatus: EquipmentStatus;
  images?: string[];
  cost?: number;
  description?: string;
}

export interface UpdateEquipmentDto {
  equipmentType?: EquipmentType;
  equName?: string;
  model?: string;
  brand?: string;
  location?: Location;
  purchaseDate?: string;
  quantityTotal?: number;
  lastServicedAt?: string;
  nextServiceDue?: string;
  warranty?: Warranty;
  equipmentStatus?: EquipmentStatus;
  images?: string[];
  cost?: number;
  description?: string;
}

