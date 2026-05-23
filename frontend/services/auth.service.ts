import { api, API_PREFIX } from "@/lib/api";
import type { AuthToken, User } from "@/types";

export const authService = {
  async signup(payload: {
    email: string;
    full_name: string;
    password: string;
  }): Promise<AuthToken> {
    const { data } = await api.post<AuthToken>(
      `${API_PREFIX}/auth/signup`,
      payload,
    );
    return data;
  },

  async login(payload: { email: string; password: string }): Promise<AuthToken> {
    const { data } = await api.post<AuthToken>(
      `${API_PREFIX}/auth/login`,
      payload,
    );
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>(`${API_PREFIX}/users/me`);
    return data;
  },
};
