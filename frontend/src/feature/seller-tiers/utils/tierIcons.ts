import {
  MdStar,
  MdEmojiEvents,
  MdWorkspacePremium,
  MdMilitaryTech,
  MdDiamond,
  MdShield,
  MdWhatshot,
  MdTrendingUp,
  MdHelpOutline,
} from "react-icons/md";
import type { IconType } from "react-icons";

export const TIER_ICONS: Record<string, IconType> = {
  MdStar,
  MdEmojiEvents,
  MdWorkspacePremium,
  MdMilitaryTech,
  MdDiamond,
  MdShield,
  MdWhatshot,
  MdTrendingUp,
};

export const AVAILABLE_ICONS_ARRAY = Object.keys(TIER_ICONS).map((key) => ({
  id: key,
  icon: TIER_ICONS[key],
}));

export const getTierIcon = (iconName?: string | null): IconType => {
  if (!iconName || !TIER_ICONS[iconName]) {
    return MdHelpOutline;
  }
  return TIER_ICONS[iconName];
};
