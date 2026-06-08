import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ClipboardList, PlusCircle, LogOut } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { T } from "@/lib/marathi";

const items = [
  { title: T.dashboard, url: "/dashboard", icon: LayoutDashboard },
  { title: T.newSurvey, url: "/new", icon: PlusCircle },
  { title: T.allSurveys, url: "/surveys", icon: ClipboardList },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, role, signOut } = useAuth();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">कु</div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm truncate">{T.appName}</span>
              <span className="text-xs text-muted-foreground truncate">{role === "admin" ? "Administrator" : "Surveyor"}</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>मेनू</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = currentPath === item.url || currentPath.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        {!collapsed && user && (
          <div className="text-xs text-muted-foreground px-2 truncate">{user.email}</div>
        )}
        <Button variant="ghost" size="sm" onClick={signOut} className="justify-start">
          <LogOut className="h-4 w-4" />{!collapsed && <span className="ml-2">{T.logout}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
