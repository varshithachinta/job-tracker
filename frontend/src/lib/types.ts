export type ApplicationStatus =
  | "applied"
  | "oa"
  | "interview"
  | "offer"
  | "rejected";

export interface Application {
  id: number;
  company_name: string;
  role_title: string;
  job_link: string | null;
  status: ApplicationStatus;
  applied_date: string | null;
  created_at: string;
  updated_at: string | null;
}