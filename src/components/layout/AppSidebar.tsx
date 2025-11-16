import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Radar, 
  BarChart3, 
  Settings, 
  Users, 
  Zap,
  FileText,
  TrendingUp,
  Shield
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: "Scan",
    url: "/scan",
    icon: Radar,
    badge: null
  },
  {
    title: "Results",
    url: "/results",
    icon: FileText,
    badge: null
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    badge: "Pro"
  }
];

const toolsItems = [
  {
    title: "Probes",
    url: "/probes",
    icon: Zap,
    badge: "New"
  },
  {
    title: "Teams",
    url: "/teams",
    icon: Users,
    badge: "Pro"
  },
  {
    title: "Benchmarks",
    url: "/benchmarks",
    icon: TrendingUp,
    badge: null
  }
];

const systemItems = [
  {
    title: "Bot Analytics",
    url: "/bot-analytics",
    icon: Shield,
    badge: "Admin"
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    badge: null
  }
];

export function AppSidebar() {
  const { open, setOpen, openMobile, setOpenMobile, isMobile, state } = useSidebar();
  const collapsed = !open;
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-r-2 border-primary" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

  const renderMenuItems = (items: typeof navigationItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink to={item.url} className={getNavCls}>
              <item.icon className="mr-3 h-4 w-4" />
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge 
                      variant={item.badge === "Pro" ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} transition-all duration-300`}
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Contour</h1>
              <p className="text-xs text-sidebar-foreground/60">Blind Spot Intelligence</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/80 mb-2">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(navigationItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/80 mb-2">
            {!collapsed && "Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(toolsItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/80 mb-2">
            {!collapsed && "System"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(systemItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <div className="text-xs text-sidebar-foreground/60 text-center">
            <p>Contour v1.0.0</p>
            <p className="mt-1">AI-Powered Intelligence</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}