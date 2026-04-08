import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui";
import {
  Map,
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  CreditCard,
  UserCog,
  LogOut,
  Globe,
} from "lucide-react";

const mainMenu = [
  { to: "/map", label: "Bản đồ", icon: Map },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const managerMenu = [
  { to: "/apartments", label: "Căn hộ", icon: Building2 },
  { to: "/contracts", label: "Hợp đồng", icon: FileText },
  { to: "/tenants", label: "Người thuê", icon: Users },
  { to: "/payments", label: "Thanh toán", icon: CreditCard },
  { to: "/users", label: "Người dùng", icon: UserCog },
];

export function AppLayout() {
  const { user, isManager, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary/20 glow-primary-sm">
                <Globe className="h-5 w-5 text-sidebar-primary" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-wide text-sidebar-foreground">
                  GIS Apartment
                </h1>
                <p className="text-[11px] text-sidebar-foreground/50">
                  {user?.fullName}
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40">
                Tổng quan
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainMenu.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        isActive={location.pathname === item.to}
                        render={<NavLink to={item.to} />}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {isManager && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40">
                  Quản lý
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {managerMenu.map((item) => (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          isActive={location.pathname === item.to}
                          render={<NavLink to={item.to} />}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => void handleLogout()}>
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto gradient-mesh">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
