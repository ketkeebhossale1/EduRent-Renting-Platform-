const base = import.meta.env.VITE_API_URL || "";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("edurent_api_token");
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function handleJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    const err = (data as { error?: string }).error || res.statusText;
    throw new Error(err);
  }
  return data as T;
}

export type RentalObjectDTO = Record<string, unknown>;

export type TransactionDTO = Record<string, unknown>;

export type DepositRecordDTO = Record<string, unknown>;

export type DamageReportDTO = Record<string, unknown>;

export const api = {
  setToken(token: string | null) {
    if (token) localStorage.setItem("edurent_api_token", token);
    else localStorage.removeItem("edurent_api_token");
  },

  getToken() {
    return localStorage.getItem("edurent_api_token");
  },

  async signup(username: string, email: string, password: string) {
    const res = await fetch(`${base}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    return handleJson<{
      token: string;
      user: { id: number; username: string; email: string };
    }>(res);
  },

  async login(username: string, password: string) {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handleJson<{
      token: string;
      user: { id: number; username: string; email: string };
    }>(res);
  },

  async getRentalObjects() {
    const res = await fetch(`${base}/api/rental-objects`);
    return handleJson<RentalObjectDTO[]>(res);
  },

  async saveRentalObject(obj: RentalObjectDTO) {
    const res = await fetch(`${base}/api/rental-objects`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(obj),
    });
    return handleJson<RentalObjectDTO>(res);
  },

  async createBooking(payload: {
    objectId: string;
    objectName: string;
    amount: number;
    duration: number;
    startDate: string;
    endDate: string;
    depositAmount: number;
    includesDeposit: boolean;
    pricePerDay?: number;
  }) {
    const res = await fetch(`${base}/api/bookings`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleJson<{ transaction: TransactionDTO }>(res);
  },

  async getDashboard() {
    const res = await fetch(`${base}/api/me/dashboard`, {
      headers: authHeaders(),
    });
    return handleJson<{
      transactions: TransactionDTO[];
      deposits: DepositRecordDTO[];
    }>(res);
  },

  async returnDeposit(depositId: string) {
    const res = await fetch(
      `${base}/api/deposits/${encodeURIComponent(depositId)}/return`,
      {
        method: "PATCH",
        headers: authHeaders(),
      }
    );
    return handleJson<DepositRecordDTO>(res);
  },

  async submitDamageReport(payload: {
    objectName: string;
    damageDescription: string;
    estimatedCost: number;
    photoUrl?: string;
  }) {
    const res = await fetch(`${base}/api/damage-reports`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleJson<DamageReportDTO>(res);
  },
};
