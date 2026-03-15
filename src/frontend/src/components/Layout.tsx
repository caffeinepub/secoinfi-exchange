import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Shield,
  ShoppingCart,
  Store,
  TrendingUp,
} from "lucide-react";
import { AppRole } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfile } from "../hooks/useQueries";

export default function Layout() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const role = profile?.role;

  const handleLogout = () => {
    clear();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl"
            data-ocid="nav.link"
          >
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="font-display text-foreground">
              Secoinfi<span className="text-primary"> Exchange</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/products"
              className={`px-3 py-1.5 rounded-md text-sm transition-colors hover:text-primary ${
                currentPath.startsWith("/products")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
              data-ocid="nav.link"
            >
              Products
            </Link>

            <Link
              to="/fixtures"
              className={`px-3 py-1.5 rounded-md text-sm transition-colors hover:text-primary ${
                currentPath.startsWith("/fixtures")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
              data-ocid="nav.link"
            >
              Fixtures
            </Link>

            {role === AppRole.BUYER && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-ocid="nav.dropdown_menu"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Buyer <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/buyer/dashboard" data-ocid="nav.link">
                      My Intents
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/buyer/orders" data-ocid="nav.link">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/buyer/intents/new" data-ocid="nav.link">
                      New Intent
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {role === AppRole.SELLER && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-ocid="nav.dropdown_menu"
                  >
                    <Store className="w-4 h-4" />
                    Seller <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/seller/dashboard" data-ocid="nav.link">
                      My Offers
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/seller/offers/new" data-ocid="nav.link">
                      New Offer
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {role === AppRole.ADMIN && (
              <Link
                to="/admin"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors hover:text-primary ${
                  currentPath.startsWith("/admin")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                data-ocid="nav.link"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {identity && profile && (
              <div className="flex items-center gap-2">
                {profile.maskedTag && (
                  <Badge
                    variant="outline"
                    className="font-mono text-xs border-primary/40 text-primary"
                  >
                    …{profile.maskedTag}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {role === AppRole.ADMIN && (
                    <Shield className="w-3 h-3 mr-1" />
                  )}
                  {role}
                </Badge>
              </div>
            )}

            {identity ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="gap-1 border-border/60"
                data-ocid="nav.button"
              >
                <LogOut className="w-3 h-3" /> Logout
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="gap-1"
                data-ocid="nav.button"
              >
                <LogIn className="w-3 h-3" />
                {isLoggingIn ? "Connecting…" : "Login"}
              </Button>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/50 py-8 mt-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Secoinfi Exchange</span>
            <span className="text-muted-foreground text-sm">
              — Brokered marketplace for buyers &amp; sellers
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()}. Built with ❤ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}
