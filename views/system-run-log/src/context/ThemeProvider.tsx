import React, { useEffect, useState } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import lightTheme from "../styles/lightTheme";
import darkTheme from "../styles/darkTheme";

export interface AppRouterProps {
    darkMode: boolean;
    toggleTheme: () => void;
}

interface Props {
    children: React.JSX.Element | React.JSX.Element[];
}
const ThemeProvider = ({ children }: Props) => {
    const isDarkMode = localStorage.getItem("darkMode") ?? "false";
    const themeIsDark = Boolean(JSON.parse(isDarkMode));
    const [darkMode, setDarkMode] = useState(themeIsDark);

    useEffect(() => {
        const handlePreferences = (e: StorageEvent) => {
            if (e.key === "darkMode" && e.newValue) {
                setDarkMode(
                    Boolean(JSON.parse(localStorage.getItem("darkMode") ?? "false"))
                );
            }
        };
        window.addEventListener("storage", (e: StorageEvent) => {
            handlePreferences(e);
        });

        return () => {
            window.removeEventListener("storage", (e) => {
                handlePreferences(e);
            });
        };
    }, []);

    return (
        <MuiThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            {children}
        </MuiThemeProvider>
    );
};

export default ThemeProvider;
