"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearToken, getToken, setToken } from "../lib/api";
import { authService } from "../services/auth.service";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth(requireAuth: boolean = false): AuthState & {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, full_name: string, password: string) => Promise<void>;
  logout: () => void;
} {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      if (active) setState({ user: null, loading: false });
      if (requireAuth) router.replace("/login");
      return;
    }
    authService
      .me()
      .then((user) => {
        if (active) setState({ user, loading: false });
      })
      .catch(() => {
        clearToken();
        if (active) setState({ user: null, loading: false });
        if (requireAuth) router.replace("/login");
      });
    return () => {
      active = false;
    };
  }, [requireAuth, router]);

  async function login(email: string, password: string) {
    const tok = await authService.login({ email, password });
    setToken(tok.access_token);
    const user = await authService.me();
    setState({ user, loading: false });
  }

  async function signup(email: string, full_name: string, password: string) {
    const tok = await authService.signup({ email, full_name, password });
    setToken(tok.access_token);
    const user = await authService.me();
    setState({ user, loading: false });
  }

  function logout() {
    clearToken();
    setState({ user: null, loading: false });
    router.replace("/login");
  }

  return { ...state, login, signup, logout };
}
