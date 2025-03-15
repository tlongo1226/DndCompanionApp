import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollText, Users, Building, Map, Sword } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function NavLink({ href, icon, children }: NavLinkProps) {
  const [location] = useLocation();
  const isActive = location.startsWith(href);

  return (
    <Link href={href}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2",
          "text-white hover:text-white",
          "bg-opacity-90 hover:bg-opacity-100",
          isActive && "bg-sidebar-accent text-white font-semibold"
        )}
      >
        {icon}
        {children}
      </Button>
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-slate-800 border-r border-slate-700 p-4 flex flex-col gap-2">
        <Link href="/">
          <h1 className="text-2xl font-bold text-white mb-6 hover:text-amber-400 transition-colors">
            D&D Journal
          </h1>
        </Link>

        <NavLink href="/" icon={<ScrollText className="h-4 w-4" />}>
          Journal Entries
        </NavLink>

        <NavLink href="/category/npc" icon={<Users className="h-4 w-4" />}>
          NPCs
        </NavLink>

        <NavLink href="/category/creature" icon={<Sword className="h-4 w-4" />}>
          Creatures
        </NavLink>

        <NavLink href="/category/location" icon={<Map className="h-4 w-4" />}>
          Locations
        </NavLink>

        <NavLink href="/category/organization" icon={<Building className="h-4 w-4" />}>
          Organizations
        </NavLink>
      </aside>

      <main className={cn(
        "bg-[url('https://images.unsplash.com/photo-1524373050940-8f19e9b858a9')] bg-cover bg-fixed",
        "before:content-[''] before:absolute before:inset-0 before:bg-background/95"
      )}>
        <div className="relative">{children}</div>
      </main>
    </div>
  );
}