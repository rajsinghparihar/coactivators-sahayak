export interface VisualAidCard {
  id: string;
  title: string;
  grade: string;
  topic: string;
  subtopic?: string;
  type: string;
  mermaidCode: string;
  description: string;
  timestamp: Date;
} 