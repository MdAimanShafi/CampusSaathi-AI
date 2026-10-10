import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 60000 });

export interface Complaint {
  id: string;
  created_at: string;
  updated_at: string;
  category: string;
  title?: string;
  location: string;
  description: string;
  ai_summary: string;
  ai_priority: string;
  status: string;
  resolution_notes: string;
}

export interface AIAnalysis {
  category: string;
  summary: string;
  description: string;
  priority: string;
  priority_reason: string;
  next_action: string;
  missing_info: string;
}

export interface NoticeSummary {
  summary: string;
  dates: string[];
  action_items: string[];
  missing_info: string;
  extracted_text?: string;
}

export interface DashboardStats {
  total: number;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  recent: Complaint[];
}

export const healthCheck = () => api.get<{ status: string; model: string }>("/health");

export const sendChat = (message: string, history: [string, string][]) =>
  api.post<{ reply: string; history: [string, string][] }>("/chat", { message, history });

export const resetChat = () => api.post("/chat/reset");

export const getCategories = () =>
  api.get<{ categories: string[]; statuses: string[] }>("/complaints/categories");

export const submitComplaint = (data: {
  category: string; title: string; description: string; location: string;
}) => api.post<{ complaint: Complaint; ai_analysis: AIAnalysis }>("/complaints", data);

export const getComplaint = (id: string) => api.get<Complaint>(`/complaints/${id}`);

export const updateComplaintStatus = (id: string, status: string, notes: string, adminKey: string) =>
  api.patch<Complaint>(`/complaints/${id}/status`, { status, notes, admin_key: adminKey });

export const listComplaints = (category?: string, status?: string) =>
  api.get<{ complaints: Complaint[]; total: number }>("/complaints", {
    params: { category, status, limit: 100 },
  });

export const getDashboard = () => api.get<DashboardStats>("/dashboard");

export const summarizeNotice = (text: string) =>
  api.post<NoticeSummary>("/notices/summarize", { text });

export const summarizeNoticeImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post<NoticeSummary>("/notices/summarize-image", form);
};

// ── IEEE / Innovation Hub ─────────────────────────────────────────────────────

export interface IEEEProject {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  theme: string;
  description: string;
  team_size: number;
  resources_needed: string;
  status: string;
  status_notes: string;
  from_feedback_id: string;
  showcase_consent: boolean;
  ai_suggestions: string;
}

export interface IEEEFeedback {
  id: string;
  created_at: string;
  category: string;
  suggestion: string;
  ai_solutions: string;
  converted_to_project: string;
}

export interface IEEEStats {
  total_projects: number;
  total_feedback: number;
  showcase_ready: number;
  by_theme: Record<string, number>;
  by_status: Record<string, number>;
}

export const getIEEEInfo = () => api.get<Record<string, unknown>>("/ieee/info");
export const getIEEEMeta = () =>
  api.get<{ themes: string[]; statuses: string[]; feedback_categories: string[] }>("/ieee/meta");

export const createProject = (data: {
  title: string; theme: string; description: string;
  team_size: number; resources_needed: string; from_feedback_id: string;
}) => api.post<IEEEProject>("/ieee/projects", data);

export const listProjects = (theme?: string, status?: string) =>
  api.get<{ projects: IEEEProject[] }>("/ieee/projects", { params: { theme, status } });

export const getShowcaseProjects = () =>
  api.get<{ projects: IEEEProject[] }>("/ieee/projects/showcase");

export const getProject = (id: string) => api.get<IEEEProject>(`/ieee/projects/${id}`);

export const updateProjectStatus = (
  id: string, status: string, notes: string, adminKey: string
) => api.patch<IEEEProject>(`/ieee/projects/${id}/status`, { status, notes, admin_key: adminKey });

export const setShowcaseConsent = (id: string, consent: boolean) =>
  api.patch<IEEEProject>(`/ieee/projects/${id}/consent`, { consent });

export const submitIEEEFeedback = (category: string, suggestion: string) =>
  api.post<IEEEFeedback>("/ieee/feedback", { category, suggestion });

export const listFeedback = (category?: string) =>
  api.get<{ feedback: IEEEFeedback[] }>("/ieee/feedback", { params: { category } });

export const getIEEEStats = () => api.get<IEEEStats>("/ieee/stats");

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  "Idea Submitted":    "text-blue-400 bg-blue-400/10",
  "Problem Validation":"text-yellow-400 bg-yellow-400/10",
  "Team Formation":    "text-violet-400 bg-violet-400/10",
  "Prototype":         "text-orange-400 bg-orange-400/10",
  "Testing":           "text-cyan-400 bg-cyan-400/10",
  "Review":            "text-amber-400 bg-amber-400/10",
  "Showcase":          "text-green-400 bg-green-400/10",
  "Archived":          "text-slate-400 bg-slate-400/10",
};

export const PRIORITY_COLORS: Record<string, string> = {
  Low: "text-green-400 bg-green-400/10",
  Medium: "text-yellow-400 bg-yellow-400/10",
  High: "text-orange-400 bg-orange-400/10",
  Critical: "text-red-400 bg-red-400/10",
};

export const STATUS_COLORS: Record<string, string> = {
  Submitted: "text-blue-400 bg-blue-400/10",
  "Under Review": "text-yellow-400 bg-yellow-400/10",
  "In Progress": "text-violet-400 bg-violet-400/10",
  Resolved: "text-green-400 bg-green-400/10",
  Rejected: "text-red-400 bg-red-400/10",
};
