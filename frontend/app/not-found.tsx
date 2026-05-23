import Link from "next/link";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Logo size={56} />
      <h1 className="font-display text-7xl font-bold mt-6 text-gradient">404</h1>
      <p className="text-muted-foreground mt-4">
        We searched the vector index and couldn&apos;t find that page.
      </p>
      <Link href="/" className="mt-8">
        <Button size="lg">Take me home</Button>
      </Link>
    </main>
  );
}
