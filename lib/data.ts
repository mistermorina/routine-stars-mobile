import type { Routine, Reward } from "@/lib/types";

export { avatarCategories } from "@/lib/avatars";

export const mockRoutines: Routine[] = [
  {
    id: "morning",
    name: "Morgenroutine",
    color: "hsl(38, 92%, 50%)",
    tasks: [
      { id: "m1", title: "Bett machen", iconName: "bed", completed: false, stars: 1 },
      { id: "m2", title: "Zähne putzen", iconName: "tooth", completed: false, stars: 1 },
      { id: "m3", title: "Anziehen", iconName: "shirt", completed: false, stars: 1 },
      { id: "m4", title: "Frühstücken", iconName: "croissant", completed: false, stars: 1 },
    ],
    schedule: {
      days: ["Mo", "Di", "Mi", "Do", "Fr"],
      time: "07:30",
    },
    reminders: {
      enabled: true,
      message: "Zeit für deine Morgenroutine!",
    },
  },
  {
    id: "evening",
    name: "Abendroutine",
    color: "hsl(255, 82%, 60%)",
    tasks: [
      {
        id: "e1",
        title: "Spielzeug aufräumen",
        iconName: "toy-brick",
        completed: false,
        stars: 2,
        timerInMinutes: 10,
        bonusStars: 2,
      },
      { id: "e2", title: "Zähne putzen", iconName: "tooth", completed: false, stars: 1 },
      { id: "e3", title: "Gute-Nacht-Geschichte", iconName: "book-open", completed: false, stars: 1 },
      { id: "e4", title: "Schlafanzug anziehen", iconName: "armchair", completed: false, stars: 1 },
    ],
    schedule: {
      days: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
      time: "19:30",
    },
    reminders: {
      enabled: true,
      message: "Zeit für deine Abendroutine!",
    },
  },
];

export const mockRewards: Reward[] = [
  { id: "r1", title: "15 Min. fernsehen", cost: 5, iconName: "tv" },
  { id: "r2", title: "Sticker auswählen", cost: 10, iconName: "award" },
  { id: "r3", title: "Später ins Bett", cost: 15, iconName: "bed" },
  { id: "r4", title: "Extra Geschichte", cost: 8, iconName: "book-open" },
];
