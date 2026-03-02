import React from "react";
import {
  Apple,
  Armchair,
  Award,
  Backpack,
  BarChart3,
  Bath,
  Bed,
  Bell,
  Bike,
  BookOpen,
  BookText,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Cookie,
  CreditCard,
  Croissant,
  Dog,
  Droplets,
  Dumbbell,
  FileText,
  Gamepad2,
  Gift,
  GlassWater,
  Globe,
  Grape,
  GripVertical,
  HandHeart,
  Heart,
  Home,
  Lamp,
  Lock,
  LogOut,
  type LucideProps,
  Moon,
  Music,
  Palette,
  PawPrint,
  PencilLine,
  Pizza,
  Plus,
  RefreshCcw,
  Rocket,
  Sandwich,
  Scissors,
  Settings,
  Shield,
  Shirt,
  ShowerHead,
  Smile,
  Sparkles,
  Star,
  Sun,
  Sunrise,
  ToyBrick,
  Trash2,
  TreePine,
  Trophy,
  Tv,
  User,
  Users,
  UtensilsCrossed,
  Waves,
  X,
  Zap,
} from "lucide-react-native";
import Svg, { Path } from "react-native-svg";

// Custom broom icon (not available in lucide-react-native)
function BroomIcon({ size = 24, color = "currentColor", ...props }: LucideProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(props as any)}
    >
      <Path d="M12 2v8" />
      <Path d="M8 10h8l1 8H7l1-8z" />
      <Path d="M9 18v4" />
      <Path d="M15 18v4" />
    </Svg>
  );
}

// Custom tooth icon (not available in lucide)
function ToothIcon({ size = 24, color = "currentColor", ...props }: LucideProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(props as any)}
    >
      <Path d="M9.34 4.1a2 2 0 0 1 2.32.42l.29.33.29-.33a2 2 0 0 1 2.32-.42l.06.02a3.83 3.83 0 0 1 3.51 3.22l.09.43H5.21l.09-.43a3.83 3.83 0 0 1 3.51-3.22l.06-.02Z" />
      <Path d="M5.2 8.28v2.95a2 2 0 0 0 .86 1.66l2.36 1.96a4 4 0 0 1 2.45 3.55V20" />
      <Path d="M18.8 8.28v2.95a2 2 0 0 1-.86 1.66l-2.36 1.96a4 4 0 0 0-2.45 3.55V20" />
    </Svg>
  );
}

// Icon registry mapping string names to components
const iconRegistry: Record<string, React.ComponentType<LucideProps>> = {
  apple: Apple,
  armchair: Armchair,
  award: Award,
  backpack: Backpack,
  "bar-chart-3": BarChart3,
  bath: Bath,
  bed: Bed,
  bell: Bell,
  bike: Bike,
  "book-open": BookOpen,
  "book-text": BookText,
  broom: BroomIcon,
  "calendar-days": CalendarDays,
  camera: Camera,
  check: Check,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "circle-check": CircleCheck,
  clock: Clock,
  cookie: Cookie,
  "credit-card": CreditCard,
  croissant: Croissant,
  dog: Dog,
  droplets: Droplets,
  dumbbell: Dumbbell,
  "file-text": FileText,
  "gamepad-2": Gamepad2,
  gift: Gift,
  "glass-water": GlassWater,
  globe: Globe,
  grape: Grape,
  "grip-vertical": GripVertical,
  "hand-heart": HandHeart,
  heart: Heart,
  home: Home,
  lamp: Lamp,
  lock: Lock,
  "log-out": LogOut,
  moon: Moon,
  music: Music,
  palette: Palette,
  "paw-print": PawPrint,
  "pencil-line": PencilLine,
  pizza: Pizza,
  plus: Plus,
  "refresh-ccw": RefreshCcw,
  rocket: Rocket,
  sandwich: Sandwich,
  scissors: Scissors,
  settings: Settings,
  shield: Shield,
  shirt: Shirt,
  "shower-head": ShowerHead,
  smile: Smile,
  sparkles: Sparkles,
  star: Star,
  sun: Sun,
  sunrise: Sunrise,
  tooth: ToothIcon,
  "toy-brick": ToyBrick,
  trash2: Trash2,
  "tree-pine": TreePine,
  trophy: Trophy,
  tv: Tv,
  user: User,
  users: Users,
  "utensils-crossed": UtensilsCrossed,
  waves: Waves,
  x: X,
  zap: Zap,
};

export function getIcon(name: string): React.ComponentType<LucideProps> {
  return iconRegistry[name] || Star;
}

export {
  BroomIcon,
  ToothIcon,
  Apple,
  Armchair,
  Award,
  Backpack,
  BarChart3,
  Bath,
  Bed,
  Bell,
  Bike,
  BookOpen,
  BookText,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Cookie,
  CreditCard,
  Croissant,
  Dog,
  Droplets,
  Dumbbell,
  FileText,
  Gamepad2,
  Gift,
  GlassWater,
  Globe,
  Grape,
  GripVertical,
  HandHeart,
  Heart,
  Home,
  Lamp,
  Lock,
  LogOut,
  Moon,
  Music,
  Palette,
  PawPrint,
  PencilLine,
  Pizza,
  Plus,
  RefreshCcw,
  Rocket,
  Sandwich,
  Scissors,
  Settings,
  Shield,
  Shirt,
  ShowerHead,
  Smile,
  Sparkles,
  Star,
  Sun,
  Sunrise,
  ToyBrick,
  Trash2,
  TreePine,
  Trophy,
  Tv,
  User,
  Users,
  UtensilsCrossed,
  Waves,
  X,
  Zap,
};
