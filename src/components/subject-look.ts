import { BarChart3, Bot, Braces, Cog, Cpu, FlaskConical, Gem, Sigma, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Each Scientia subject's icon and accent. */
export const SUBJECT_LOOK: Record<string, { Icon: LucideIcon; accent: string }> = {
  mathematics: { Icon: Sigma, accent: "bg-gold" },
  statistics: { Icon: BarChart3, accent: "bg-gold" },
  computerScience: { Icon: Cpu, accent: "bg-compute" },
  programmingLanguages: { Icon: Braces, accent: "bg-compute" },
  electricalEngineering: { Icon: Zap, accent: "bg-sky" },
  robotics: { Icon: Bot, accent: "bg-human" },
  chemistry: { Icon: FlaskConical, accent: "bg-formal" },
  mechanicalEngineering: { Icon: Cog, accent: "bg-sky" },
  materialsScience: { Icon: Gem, accent: "bg-human" },
};
