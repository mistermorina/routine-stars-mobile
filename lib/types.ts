export type AvatarAssetId =
  | "superheld_junge_blau"
  | "superheld_junge_gruen"
  | "superheld_junge_rot"
  | "superheld_junge_tuerkis"
  | "superheld_junge_lila"
  | "superheld_maedchen_pink"
  | "superheld_maedchen_tuerkis"
  | "superheld_maedchen_gelb"
  | "superheld_maedchen_blau"
  | "superheld_maedchen_lila";

export type AvatarValue =
  | string
  | { type: "emoji"; emoji: string }
  | { type: "asset"; id: AvatarAssetId }
  | { type: "photo"; uri: string };

export interface Child {
  id: string;
  name: string;
  avatar: AvatarValue;
  stars: number;
  theme: ChildTheme;
  backgroundSkin?: BackgroundSkinId;
  ageGroup?: AgeGroup;
}

export interface ChildProfile {
  name: string;
  avatar: AvatarValue;
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

/* ------------------------------------------------------------------ *
 * WEEKDAY CONVENTION — read this before touching a schedule.
 *
 * A weekday is stored as the German two-letter LABEL ("Mo" … "So"),
 * never as a number. That convention predates the notification engine:
 * `lib/default-values.ts` produces these strings, the dashboard "Heute"
 * filter reads them, and installed apps already carry them in
 * AsyncStorage. Renaming it to 0–6 would cost a storage migration for
 * zero benefit, so the labels stay and every numeric conversion is
 * centralised in exactly two places:
 *
 *   JS `Date.getDay()` (0 = Sunday)      → getLocalWeekday()  in lib/local-date.ts
 *   expo weekly trigger (1 = Sunday)     → toExpoWeekday()    in lib/notifications.ts
 *
 * Do not derive a weekday number anywhere else.
 * ------------------------------------------------------------------ */
export type Weekday = "Mo" | "Di" | "Mi" | "Do" | "Fr" | "Sa" | "So";

export interface Schedule {
  /** Missing or empty means: the routine is due every day. */
  days: Weekday[];
  /** Local 24h time as "HH:mm". Without it no reminder can be scheduled. */
  time?: string;
}

export interface Reminders {
  enabled: boolean;
  /** Custom notification body; falls back to a German default per routine. */
  message?: string;
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

/**
 * Master switch for routine reminders, persisted under
 * `KEYS.NOTIFICATION_SETTINGS`. `syncRoutineReminders()` honours it: while it
 * is off nothing is scheduled, no matter what a single routine says.
 *
 * The former `pushNotifications` / `rewardNotifications` / `quietFrom` /
 * `quietTo` fields were removed — nothing ever read them and the app has no
 * push backend and no quiet-hours implementation, so the switches promised
 * behaviour that did not exist.
 */
export interface NotificationSettings {
  routineReminders: boolean;
}

export interface ActivityLog {
  id: string;
  childId: string;
  taskId: string;
  taskTitle: string;
  date: string; // ISO string YYYY-MM-DD
  stars: number;
}

export type DailyMissionKind =
  | "complete_3_tasks"
  | "earn_5_stars"
  | "complete_1_routine";

export interface DailyMission {
  id: string;
  date: string;
  kind: DailyMissionKind;
  title: string;
  description: string;
  target: number;
}

export type StickerId =
  | "first_task"
  | "first_routine"
  | "daily_mission_1"
  | "daily_mission_3"
  | "streak_3"
  | "streak_7"
  | "stars_25"
  | "stars_50"
  | "active_days_10";

export interface StickerDefinition {
  id: StickerId;
  title: string;
  description: string;
  shortLabel: string;
}

export interface ChildProgressState {
  unlockedStickerIds: StickerId[];
  claimedMissionDates: string[];
  lastSeenUnlockIds?: StickerId[];
}

export type StickerThemeWorld =
  | "tierfreunde"
  | "weltraum"
  | "magie"
  | "fahrzeuge"
  | "natur"
  | "helden"
  | "essen"
  | "musik"
  | "sport"
  | "meer"
  | "gute-nacht";
export type StickerCategory =
  | "tiere"
  | "weltraum"
  | "magie"
  | "fahrzeuge"
  | "natur"
  | "helden"
  | "essen"
  | "musik"
  | "sport"
  | "meer"
  | "gute-nacht";
export type StickerRarity = "common" | "uncommon" | "rare" | "epic";
export type StickerRewardMode = "routine_complete" | "daily_complete";
export type StickerSelectionMode = "child_choice";
export type StickerUnlockReason = StickerRewardMode;

export type AnimalStickerId =
  | "loewe"
  | "giraffe"
  | "panda"
  | "hase"
  | "fuchs"
  | "baer"
  | "katze"
  | "hund"
  | "eule"
  | "schildkroete";

export type GeneratedStickerId =
  | "weltraum_rakete"
  | "weltraum_planet"
  | "weltraum_astronautenhelm"
  | "weltraum_mondrover"
  | "gute_nacht_schlafmond"
  | "gute_nacht_traumwolke"
  | "gute_nacht_sternenbuch"
  | "gute_nacht_pyjama_baer"
  | "magie_zauberhut"
  | "magie_sternenstab"
  | "magie_sternendrache"
  | "magie_kristalle"
  | "magie_einhorn"
  | "magie_sternentrank"
  | "magie_zauberbuch"
  | "magie_schlossturm"
  | "magie_schatztruhe"
  | "magie_mondlaterne"
  | "fahrzeuge_feuerwehr"
  | "fahrzeuge_lokomotive"
  | "fahrzeuge_schulbus"
  | "fahrzeuge_heissluftballon"
  | "fahrzeuge_hubschrauber"
  | "fahrzeuge_roller"
  | "fahrzeuge_traktor"
  | "fahrzeuge_uboot"
  | "fahrzeuge_raketenboard"
  | "fahrzeuge_baukran"
  | "natur_sonnenblume"
  | "natur_regenbogen"
  | "natur_berg"
  | "natur_pilzhaus"
  | "natur_apfelbaum"
  | "natur_wasserfall"
  | "natur_herbstblatt"
  | "natur_muschel"
  | "natur_regenwolke"
  | "natur_tannenzapfen"
  | "helden_sternencape"
  | "helden_mut_schild"
  | "helden_helferhelm"
  | "helden_freundlichkeits_megafon"
  | "helden_mutkompass"
  | "helden_rettungsrucksack"
  | "helden_teamhandschuhe"
  | "helden_funkelmaske"
  | "helden_leuchtturm"
  | "helden_heldenmedaille"
  | "essen_erdbeere"
  | "essen_banane"
  | "essen_porridge"
  | "essen_sandwich"
  | "essen_suppe"
  | "essen_cupcake"
  | "essen_sternkeks"
  | "essen_bento_box"
  | "essen_orangensaft"
  | "essen_eiswaffel"
  | "musik_trommel"
  | "musik_gitarre"
  | "musik_tamburin"
  | "musik_mikrofon"
  | "musik_kopfhoerer"
  | "musik_klavier"
  | "musik_trompete"
  | "musik_noten"
  | "musik_plattenspieler"
  | "musik_konzertkarte"
  | "sport_fussball"
  | "sport_basketball"
  | "sport_sneaker"
  | "sport_pokal"
  | "sport_schwimmbrille"
  | "sport_springseil"
  | "sport_zielscheibe"
  | "sport_skateboard"
  | "sport_yogamatte"
  | "sport_zielflagge"
  | "meer_wal"
  | "meer_segelboot"
  | "meer_seestern"
  | "meer_leuchtturm"
  | "meer_schatzkarte"
  | "meer_muschel"
  | "meer_delfin"
  | "meer_korallenriff"
  | "meer_flaschenpost"
  | "meer_mondwelle";

export type StickerAssetId = AnimalStickerId | GeneratedStickerId;

export interface StickerCollectionEntry {
  id: string;
  stickerId: StickerAssetId;
  earnedDate: string;
  reason: StickerUnlockReason;
  eventKey: string;
  routineId?: string;
  routineName?: string;
  slot: number;
  createdAt: string;
}

export interface StickerCollectionState {
  collectedStickers: StickerCollectionEntry[];
  claimedEventKeys: string[];
}

export interface StickerRewardSettings {
  rewardMode: StickerRewardMode;
  selectionMode: StickerSelectionMode;
}

export type StickerWallEntry = StickerCollectionEntry;
export type StickerWallState = StickerCollectionState;

// --- Template Types ---
export type AgeGroup = '3-5' | '6-8' | '9-12';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'flexible';
export type RoutineCategory = 'hygiene' | 'school' | 'household' | 'meals' | 'sport' | 'evening' | 'weekend' | 'special';
export type ChildTheme = 'sterne' | 'tiere' | 'galaxy';
export type BackgroundSkinId = "none" | "space" | "animals" | "magic" | "nature" | "heroes";

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
  iconName: string;
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
