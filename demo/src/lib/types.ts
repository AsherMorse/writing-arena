import type { GraderError } from "@/lib/grading/client-constants";

export type Message = {
  role: "ai" | "user";
  content: string;
  score?: number;
  feedback?: string[];
  errors?: GraderError[];
  errorCount?: number;
  damage?: number;
  blocked?: boolean;
  blockReason?: string;
};

export type GameState = {
  messages: Message[];
  health: number;
  storySummary: string;
  checkpoint: number;
};

export type CheckpointState = {
  messages: Message[];
  storySummary: string;
  savedAt: number;
};

export type Ending = {
  outcome: string;
  title: string;
  message: string;
};
