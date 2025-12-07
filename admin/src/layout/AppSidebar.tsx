"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import useAuthStore from "@/store/authStore";
import { GridIcon } from "../icons/index";
import {
  ChevronDown,
  Settings,
  FolderKanban,
  MessageSquareWarning,
  FileText,
  Wrench,
  UserCheck,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  roles?: ("director" | "admin" | "head" | "user")[];
  departments?: ("accounts" | "technical" | "it" | "sales" | "store")[];
};

const AppSidebar: React.FC = () => {
  const { isMobileOpen } = useSidebar();
  const pathname = usePathname();
  const { user, role } = useAuthStore();

  // Define navigation items with role-based access
  const allNavItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      path: "/",
      roles: ["director", "admin", "head", "user"],
    },
    {
      icon: <FolderKanban size={20} />,
      name: "Projects",
      path: role === "user" ? "/projects/user" : "/projects",
      roles: ["director", "admin", "head", "user"],
    },
    {
      icon: <MessageSquareWarning size={20} />,
      name: "Complaints",
      path: role === "user" ? "/complaints/user" : "/complaints",
      roles: ["director", "admin", "head", "user"],
    },
    {
      icon: <FileText size={20} />,
      name: "Invoices",
      path: "/invoices",
      roles: ["director", "admin", "head"],
      departments: ["accounts", "sales"],
    },
    {
      icon: <Wrench size={20} />,
      name: "Maintenances",
      path: role === "user" ? "/maintenances/user" : "/maintenances",
      roles: ["director", "admin", "head", "user"],
      departments: ["technical", "it"],
    },
    {
      icon: <UserCheck size={20} />,
      name: "Approvals",
      path: "/approvals",
      roles: ["director", "admin"],
    },
    {
      icon: <Settings size={20} />,
      name: "Profile",
      path: "/profile",
      roles: ["director", "admin", "head", "user"],
    },
  ];

  // Filter nav items based on user role and department
  const navItems = allNavItems.filter((item) => {
    // Check role access
    if (item.roles && role && !item.roles.includes(role)) {
      return false;
    }

    // For heads, check department access
    if (role === "head" && item.departments) {
      if (!user?.department || !item.departments.includes(user.department)) {
        return false;
      }
    }

    // For users, show only items without department restrictions
    // or handle maintenances specially
    if (role === "user" && item.departments) {
      // Users can see maintenances if they're assigned
      if (item.name === "Maintenances") {
        return true;
      }
      return false;
    }

    return true;
  });

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => {
      if (path === "/") return pathname === "/";
      return pathname?.startsWith(path);
    },
    [pathname]
  );

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: "main",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, navItems]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // Desktop icon-only menu item with tooltip
  const renderDesktopMenuItem = (nav: NavItem) => {
    if (!nav.path) return null;

    return (
      <li key={nav.name} className="relative group">
        <Link
          href={nav.path}
          className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
            isActive(nav.path)
              ? "bg-primary-500 text-white"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {nav.icon}
        </Link>
        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
          {nav.name}
          {/* Arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
        </div>
      </li>
    );
  };

  // Mobile full menu items
  const renderMobileMenuItems = (navItems: NavItem[], menuType: "main") => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              <span className="menu-item-text">{nav.name}</span>
              <ChevronDown
                className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "rotate-180 text-primary-700"
                    : ""
                }`}
              />
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                <span className="menu-item-text">{nav.name}</span>
              </Link>
            )
          )}
          {nav.subItems && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop Sidebar - Icon only */}
      <aside className="fixed hidden lg:flex flex-col top-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen w-[80px] z-50 border-r border-gray-200 px-4">
        {/* Logo */}
        <div className="py-6 flex justify-center">
          <Link href="/">
            <Image
              src="/images/logo/logo-icon.png"
              alt="TechnoTrends Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto no-scrollbar">
          <ul className="flex flex-col items-center gap-3">
            {navItems.map((nav) => renderDesktopMenuItem(nav))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar - Full width with text */}
      <aside
        className={`fixed lg:hidden mt-16 flex flex-col top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 w-[290px] ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
          <Link href="/" className="py-4">
              <img
                src="/images/logo/logo.png"
                alt="TechnoTrends Logo"
                className="w-44"
              />
          </Link>
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start">
                  Menu
                </h2>
                {renderMobileMenuItems(navItems, "main")}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
