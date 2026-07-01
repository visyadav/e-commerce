"use client";

import * as React from "react";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
    const { state } = useAuth();

    React.useEffect(() => {
        const root = document.documentElement;
        if (state.user?.themeColor) {
            root.setAttribute("data-theme", state.user.themeColor);
        } else {
            root.removeAttribute("data-theme");
        }
    }, [state.user?.themeColor]);

    return <>{children}</>;
}
