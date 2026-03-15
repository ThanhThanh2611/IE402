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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <h1 className="text-lg font-bold text-sidebar-primary">
              GIS Apartment
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              {user?.fullName}
            </p>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Tổng quan</SidebarGroupLabel>
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
                <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
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
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
