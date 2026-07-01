"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import * as LucideIcons from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarRail,
} from "@/src/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/src/components/ui/dropdown-menu"
import {
    ChevronDown,
    ChevronsDown,
    ChevronsUp,
    ChevronsUpDown,
    LogOut,
    Home,
    Moon,
    Sun,
    Palette
} from "lucide-react"

import { useAuth } from "@/src/features/auth/hooks/useAuth"
import { navigationService } from "@/src/services/navigation/navigation-service"
import { profileService } from "@/src/services/users/profile-service"
import { ROUTES } from "@/src/constants/routes"
import type { MenuItemResponse } from "@/src/types"
import { normalizeMenuUrl } from "@/src/utils/url"

// Dynamic icon resolution helper
const getIconComponent = (iconName: string | null) => {
    if (!iconName) return Home;
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon || Home;
};

function NavItem({ item, expandAll, expandActionCount }: { item: MenuItemResponse, expandAll?: boolean, expandActionCount?: number }) {
    const pathname = usePathname()
    const hasChildren = item.children && item.children.length > 0;

    const itemUrl = normalizeMenuUrl(item.url)
    const isItemActive = itemUrl === "/" ? pathname === itemUrl : pathname.startsWith(itemUrl)

    const isChildActive = hasChildren && item.children.some((subItem) => {
        const subItemUrl = normalizeMenuUrl(subItem.url)
        return subItemUrl === "/" ? pathname === subItemUrl : pathname.startsWith(subItemUrl)
    })

    const [isOpen, setIsOpen] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(`sidebar-menu-${item.id}`)
            if (stored !== null) {
                return stored === 'true' || isChildActive
            }
        }
        return isChildActive
    })

    React.useEffect(() => {
        if (isChildActive) {
            Promise.resolve().then(() => {
                setIsOpen(true)
            })
            localStorage.setItem(`sidebar-menu-${item.id}`, 'true')
        }
    }, [isChildActive, pathname, item.id])

    React.useEffect(() => {
        if (expandActionCount !== undefined && expandActionCount > 0 && expandAll !== undefined) {
            Promise.resolve().then(() => {
                setIsOpen(expandAll)
            })
            localStorage.setItem(`sidebar-menu-${item.id}`, String(expandAll))
        }
    }, [expandAll, expandActionCount, item.id])

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isItemActive || isChildActive}
                className={(isItemActive || isChildActive) ? "!bg-primary !text-primary-foreground hover:!bg-primary/90" : ""}
                onClick={(e) => {
                    if (hasChildren) {
                        e.preventDefault()
                        const nextState = !isOpen
                        setIsOpen(nextState)
                        localStorage.setItem(`sidebar-menu-${item.id}`, String(nextState))
                    }
                }}
            >
                <a href={itemUrl} className="flex flex-1 items-center gap-2">
                    {React.createElement(getIconComponent(item.icon), { className: "size-4" })}
                    <span>{item.title}</span>
                    {hasChildren && (
                        <ChevronDown
                            className="ml-auto transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]"
                            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                    )}
                </a>
            </SidebarMenuButton>
            {hasChildren && (
                <div
                    className="grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]"
                    style={{
                        gridTemplateRows: isOpen ? '1fr' : '0fr',
                        opacity: isOpen ? 1 : 0,
                    }}
                >
                    <div className="overflow-hidden">
                        <SidebarMenuSub>
                            {item.children.map((subItem, index) => {
                                const subItemUrl = normalizeMenuUrl(subItem.url)
                                const isSubItemActive = subItemUrl === "/" ? pathname === subItemUrl : pathname.startsWith(subItemUrl)
                                return (
                                    <SidebarMenuSubItem
                                        key={subItem.id}
                                        className="transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]"
                                        style={{
                                            transitionDelay: isOpen ? `${index * 40}ms` : '0ms',
                                            opacity: isOpen ? 1 : 0,
                                            transform: isOpen ? 'translateX(0)' : 'translateX(-8px)',
                                        }}
                                    >
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={isSubItemActive}
                                            className={isSubItemActive ? "!bg-secondary !text-secondary-foreground hover:!bg-secondary/80" : ""}
                                        >
                                            <a href={subItemUrl}>
                                                <span>{subItem.title}</span>
                                            </a>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                )
                            })}
                        </SidebarMenuSub>
                    </div>
                </div>
            )}
        </SidebarMenuItem>
    )
}

export function AppSidebar() {
    const router = useRouter()
    const { state, logout, updateUser } = useAuth()
    const [menus, setMenus] = React.useState<MenuItemResponse[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [expandAll, setExpandAll] = React.useState(false)
    const [expandActionCount, setExpandActionCount] = React.useState(0)
    const { theme, setTheme } = useTheme()

    React.useEffect(() => {
        if (!state.initialized) {
            return;
        }

        if (!state.user) {
            router.push(ROUTES.LOGIN);
            return;
        }

        navigationService.getSideMenu()
            .then((data) => {
                setMenus(data || []);
            })
            .catch((err) => {
                console.error("Failed to load side-menu navigation:", err);
                toast.error("Failed to load navigation menus");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [state.initialized, state.user, router])

    const handleLogout = () => {
        logout()
        toast.success("Successfully logged out")
        router.push(ROUTES.LOGIN)
    }

    const user = state.user
    const fullName = user ? user.fullName : "Admin User"
    const initials = user
        ? user.fullName.split(" ").map(n => n.charAt(0)).join("").toUpperCase()
        : "AU"

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <div className="grid flex-1 text-left text-2xl leading-tight">
                                <span className="truncate font-semibold">
                                    E-Commerce
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    Admin Hub
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="flex justify-between items-center w-full">
                        <span>Menu</span>
                        {menus.length > 0 && menus.some(m => m.children && m.children.length > 0) && (
                            <button
                                onClick={() => {
                                    setExpandAll(!expandAll);
                                    setExpandActionCount(c => c + 1);
                                }}
                                className="text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors p-1 -mr-1.5 rounded-sm cursor-pointer"
                                title={expandAll ? "Collapse All Submenus" : "Expand All Submenus"}
                            >
                                {expandAll ? <ChevronsUp className="size-4" /> : <ChevronsDown className="size-4" />}
                            </button>
                        )}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {isLoading ? (
                            <div className="p-2 space-y-3">
                                <div className="h-8 w-full animate-pulse rounded-md bg-muted/65" />
                                <div className="h-8 w-full animate-pulse rounded-md bg-muted/65" />
                                <div className="h-8 w-full animate-pulse rounded-md bg-muted/65" />
                            </div>
                        ) : menus.length > 0 ? (
                            <SidebarMenu>
                                {menus.map((item) => (
                                    <NavItem
                                        key={item.id}
                                        item={item}
                                        expandAll={expandAll}
                                        expandActionCount={expandActionCount}
                                    />
                                ))}
                            </SidebarMenu>
                        ) : (
                            <div className="px-4 py-2 text-xs text-muted-foreground">
                                No menu items found.
                            </div>
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-1.5 p-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="flex-1 overflow-hidden data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                                        {initials}
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{fullName}</span>
                                        <span className="truncate text-xs text-muted-foreground">Logged In</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-75 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                             >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground font-semibold text-xs border border-border">
                                            {initials}
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{fullName}</span>
                                            <span className="truncate text-xs text-muted-foreground">Active Session</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="cursor-pointer">
                                        <Palette className="mr-2 size-4" />
                                        Theme Color
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            {[
                                                { name: "Default (Zinc)", value: "default", bg: "bg-zinc-800" },
                                                { name: "Red", value: "red", bg: "bg-red-600" },
                                                { name: "Blue", value: "blue", bg: "bg-blue-600" },
                                                { name: "Green", value: "green", bg: "bg-green-600" },
                                                { name: "Orange", value: "orange", bg: "bg-orange-500" },
                                                { name: "Violet", value: "violet", bg: "bg-violet-600" },
                                                { name: "Stone", value: "stone", bg: "bg-stone-600" },
                                                { name: "Slate", value: "slate", bg: "bg-slate-600" },
                                                { name: "Pink", value: "pink", bg: "bg-pink-600" },
                                                { name: "Olive", value: "olive", bg: "bg-lime-700" }
                                            ].map((themeItem) => (
                                                <DropdownMenuItem
                                                    key={themeItem.value}
                                                    className="cursor-pointer flex items-center justify-between"
                                                    onClick={async () => {
                                                        try {
                                                            await profileService.updateTheme(themeItem.value);
                                                            updateUser({ themeColor: themeItem.value });
                                                            toast.success(`Theme updated to ${themeItem.name}`);
                                                        } catch (error) {
                                                            console.error("Failed to persist theme color:", error);
                                                            toast.error("Failed to update theme in database, but applied locally.");
                                                            updateUser({ themeColor: themeItem.value });
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`w-3 h-3 rounded-full mr-2 ${themeItem.bg}`} />
                                                        {themeItem.name}
                                                    </div>
                                                    {state.user?.themeColor === themeItem.value && (
                                                        <span className="text-xs font-medium opacity-50 ml-2">Active</span>
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                                    <LogOut className="mr-2 size-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground transition-colors cursor-pointer border border-transparent"
                            title="Toggle theme"
                        >
                            <Sun className="size-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute size-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </button>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
