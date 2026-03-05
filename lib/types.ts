export interface Child {
  id: string;
  name: string;
  avatar: string;
  stars: number;
  theme: ChildTheme;
  ageGroup?: AgeGroup;
}

export interface ChildProfile {
  name: string;
  avatar: string;
  theme: ChildTheme;
  ageGroup: AgeGroup;
}

export interface Task {
  id: string;
  title: string;
  iconName: string;
  completed: boolean;
  stars: number;
  timerInMinutes?: number;
  bonusStars?: number;
}

export interface Schedule {
  days: ("Mo" | "Di" | "Mi" | "Do" | "Fr" | "Sa" | "So")[];
  time: string; // HH:mm format
}

export interface Reminders {
  enabled: boolean;
  message: string;
}

export interface Routine {
  id: string;
  name: string;
  tasks: Task[];
  color?: string;
  schedule?: Schedule;
  reminders?: Reminders;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  iconName: string;
}

export interface NotificationSettings {
  routineReminders: boolean;
  pushNotifications: boolean;
  rewardNotifications: boolean;
  quietFrom: string;
  quietTo: string;
}

export interface ActivityLog {
  id: string;
  childId: string;
  taskId: string;
  taskTitle: string;
  date: string; // ISO string YYYY-MM-DD
  stars: number;
}

// --- Template Types ---
export type AgeGroup = '3-5' | '6-8' | '9-12';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'flexible';
export type RoutineCategory = 'hygiene' | 'school' | 'household' | 'meals' | 'sport' | 'evening' | 'weekend' | 'special';
export type ChildTheme = 'sterne' | 'tiere' | 'galaxy';

export interface TaskTemplate {
  title: string;
  iconName: string;
  stars: number;
  timerInMinutes?: number;
  bonusStars?: number;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  category: RoutineCategory;
  ageGroups: AgeGroup[];
  timeOfDay: TimeOfDay;
  suggestedTime?: string;
  color: string;
  tasks: TaskTemplate[];
}

// --- Reward Suggestion Types ---
export type RewardCategory = 'screen-time' | 'activities' | 'treats' | 'privileges' | 'social' | 'material' | 'special';

export interface RewardSuggestion {
  id: string;
  title: string;
  category: RewardCategory;
  cost: number;
  iconName: string;
}

export interface RewardCategoryInfo {
  id: RewardCategory;
  label: string;
  emoji: string;
}

// --- Icon Types ---
export type IconCategory = 'hygiene' | 'clothing' | 'meals' | 'school' | 'household' | 'leisure' | 'sport' | 'bedtime' | 'time' | 'rewards' | 'general';

export interface IconEntry {
  name: string;
  label: string;
  category: IconCategory;
}

// --- Task Suggestion Types ---
export interface TaskSuggestion {
  title: string;
  iconName: string;
  stars: number;
  timerInMinutes?: number;
  relevanceScore: number;
}
