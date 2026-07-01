import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/src/components/ui/navigation-menu"
import { Modetoggle } from "./theme-toggle/ModeToggle"

export function TopNavigation() {
    return (
        <div className="flex items-center justify-between w-full">
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                            {/* Navigation links can go here */}
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>

            <div className="ml-auto">
                <Modetoggle />
            </div>
        </div>
    )
}
