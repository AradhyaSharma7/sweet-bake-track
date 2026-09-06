import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Moon, ShoppingBag, Sun, MonitorSmartphone, Palette } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORIES, categorySlug } from "@/lib/product-images";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

const navLinkClass =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

function ThemeMenu() {
  const { theme, resolved, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {resolved === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
          <Sun className="h-4 w-4" /> Light {theme === "light" && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
          <Moon className="h-4 w-4" /> Dark {theme === "dark" && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
          <MonitorSmartphone className="h-4 w-4" /> Match device {theme === "system" && "✓"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const { count } = useCart();
  const { user, isRider, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-lg leading-none font-semibold tracking-tight">
            Nathan&rsquo;s Bakery
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-5 md:flex">
          <Link to="/shop" className={navLinkClass}>
            Shop
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/shop/$category"
              params={{ category: categorySlug(c) }}
              className={navLinkClass}
            >
              {c}
            </Link>
          ))}
          <Link to="/about" className={navLinkClass}>
            About
          </Link>
          <Link to="/contact" className={navLinkClass}>
            Contact
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <div className="hidden sm:block">
            <ThemeMenu />
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/cart" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="tabular-nums">{count}</span>
            </Link>
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: "/orders" })}>
                  My orders
                </DropdownMenuItem>
                {isRider && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/rider" })}>
                    Rider dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="grid gap-2">
            <Link to="/shop" onClick={() => setOpen(false)} className={navLinkClass}>
              Shop everything
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to="/shop/$category"
                params={{ category: categorySlug(c) }}
                onClick={() => setOpen(false)}
                className={navLinkClass}
              >
                {c}
              </Link>
            ))}
            <Link to="/about" onClick={() => setOpen(false)} className={navLinkClass}>
              About
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)} className={navLinkClass}>
              Contact
            </Link>
            <Link to="/orders" onClick={() => setOpen(false)} className={navLinkClass}>
              My orders
            </Link>
            <div className="flex items-center gap-2 pt-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <ThemeMenu />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
