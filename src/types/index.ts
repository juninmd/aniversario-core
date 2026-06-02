export interface Anniversary {
  id: string;
  name: string;
  date: string;
  type: "birthday" | "wedding" | "other";
  notes?: string;
}

export interface CreateAnniversaryInput {
  name: string;
  date: string;
  type: "birthday" | "wedding" | "other";
  notes?: string;
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "user";
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
