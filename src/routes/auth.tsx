import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

type Search = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Nathan's Bakery" },
      {
        name: "description",
        content:
          "Sign in to place bakery orders, track your delivery live and keep your signed order forms.",
      },
      { property: "og:title", content: "Sign in — Nathan's Bakery" },
      { property: "og:description", content: "Sign in to order and track your bakery delivery." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"customer" | "rider">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const target = redirect && redirect.startsWith("/") ? redirect : "/";

  useEffect(() => {
    if (user) navigate({ to: target });
  }, [user, target, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Welcome back");
      navigate({ to: target });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName, phone, role },
        },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Account created — you're signed in");
      navigate({ to: target });
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-4xl">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-muted-foreground">
        Orders, live delivery tracking and signed forms all live in your account.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-4">
        {mode === "signup" && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Mobile number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>I am a</Label>
              <div className="mt-2 flex gap-2">
                {(["customer", "rider"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={
                      role === r
                        ? "rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
                        : "rounded-full border border-border px-5 py-2 text-sm hover:bg-secondary"
                    }
                  >
                    {r === "customer" ? "Customer" : "Delivery rider"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <Button
        variant="outline"
        className="mt-3 w-full"
        onClick={async () => {
          const result = await lovable.auth.signInWithOAuth("google", {
            redirect_uri: window.location.origin,
          });
          if (result.error) {
            toast.error("Google sign-in didn't work. Try email instead.");
            return;
          }
          if (result.redirected) return;
          navigate({ to: target });
        }}
      >
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
        <button
          className="underline underline-offset-4"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
