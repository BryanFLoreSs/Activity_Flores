export type Student = {
  id: number;
  student_number: string;
  first_name: string;
  last_name: string;
  course: string;
  year_level: number;
  created_at: string;
};

export type StudentResponse = {
  source: "cloud" | "physical";
  count: number;
  data: Student[];
};

export type User = { id: number; name: string; email: string };

type ApiOptions = RequestInit & { token?: string | null };

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      sessionStorage.removeItem("student_token");
    }

    const validation = result?.errors
      ? Object.values(result.errors as Record<string, string[]>).flat()[0]
      : null;
    throw new ApiError(validation || result?.message || `Request failed (${response.status}).`, response.status);
  }

  return result as T;
}

export function getToken(): string | null {
  return typeof window === "undefined" ? null : sessionStorage.getItem("student_token");
}
