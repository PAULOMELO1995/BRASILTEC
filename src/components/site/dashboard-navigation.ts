import {
  Bell,
  BookOpen,
  CircleHelp,
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";

export const dashboardNavGroups = [
  {
    label: "Visão geral",
    items: [
      { to: "/painel", label: "Painel", icon: LayoutDashboard },
      { to: "/notificacoes", label: "Notificações", icon: Bell },
    ],
  },
  {
    label: "Meu negócio",
    items: [
      { to: "/produtos", label: "Produtos", icon: Package },
      { to: "/pedidos", label: "Pedidos", icon: ShoppingBag },
      { to: "/membros", label: "Membros", icon: BookOpen },
      { to: "/financeiro", label: "Financeiro", icon: Wallet },
      { to: "/afiliados", label: "Afiliados", icon: Users },
    ],
  },
  {
    label: "Gestão e ajuda",
    items: [
      { to: "/admin", label: "Admin", icon: ShieldCheck },
      { to: "/suporte", label: "Suporte", icon: CircleHelp },
    ],
  },
] as const;

export function isDashboardPath(pathname: string): boolean {
  return dashboardNavGroups.some((group) =>
    group.items.some((item) => isNavigationItemActive(pathname, item.to)),
  );
}

export function isNavigationItemActive(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function getDashboardPageLabel(pathname: string): string {
  if (pathname === "/produtos/novo") return "Criar produto";
  for (const group of dashboardNavGroups) {
    const item = group.items.find((entry) =>
      isNavigationItemActive(pathname, entry.to),
    );
    if (item) return item.label;
  }
  return "Painel";
}
