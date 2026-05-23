"use client";

import { LogOut, ShieldCheck, UserCircle2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/lib/utils";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6 md:p-10 max-w-3xl w-full mx-auto space-y-6">
      <header className="mb-2">
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
          Account
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          <span className="text-gradient">Settings</span>
        </h1>
      </header>

      <Card>
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-brand-gradient flex items-center justify-center text-xl font-semibold">
            {user ? initials(user.full_name) : "—"}
          </div>
          <div>
            <div className="text-lg font-semibold">{user?.full_name}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-brand-cyan" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Security</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sessions are signed with JWT (HS256, 7-day expiry). Tokens are
              stored locally and cleared on sign-out.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <UserCircle2 className="h-5 w-5 text-brand-fuchsia" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Workspace</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Your documents and chats are isolated to your account. Vector
              queries are owner-scoped.
            </p>
            <Button variant="destructive" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
