import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import ThemeProvider from "../context/ThemeProvider";
import { PortalContainerContext } from "./PortalContainerContext";

interface WithShadowDOMProps {
    styles?: string[];
    links?: string[];
}

const createEmotionCache = (container: HTMLElement) =>
    createCache({
        key: "mui-shadow",
        prepend: true,
        container,
    });

const withShadowDOM = <P extends object>(
    WrappedComponent: React.ComponentType<P>
) => {
    return ({ styles = [], links = [], ...props }: P & WithShadowDOMProps) => {
        const hostRef = useRef<HTMLDivElement>(null);
        const shadowRootRef = useRef<ShadowRoot | null>(null);
        const portalContainerRef = useRef<HTMLDivElement | null>(null);
        const emotionStyleRef = useRef<HTMLDivElement | null>(null);
        const rootInstanceRef = useRef<ReactDOM.Root | null>(null);

        useEffect(() => {
            const host = hostRef.current;
            if (!host) return;

            if (!shadowRootRef.current) {
                shadowRootRef.current = host.attachShadow({ mode: "open" });

                emotionStyleRef.current = document.createElement("div");
                shadowRootRef.current.appendChild(emotionStyleRef.current);

                links.forEach((href) => {
                    const link = document.createElement("link");
                    link.rel = "stylesheet";
                    link.href = href;
                    shadowRootRef.current!.appendChild(link);
                });

                styles.forEach((css) => {
                    const styleTag = document.createElement("style");
                    styleTag.textContent = css;
                    shadowRootRef.current!.appendChild(styleTag);
                });

                portalContainerRef.current = document.createElement("div");
                shadowRootRef.current.appendChild(portalContainerRef.current);
            }

            const emotionCache = createEmotionCache(emotionStyleRef.current!);


            if (portalContainerRef.current) {
                if (!rootInstanceRef.current) {
                    rootInstanceRef.current = ReactDOM.createRoot(portalContainerRef.current);
                }

                rootInstanceRef.current.render(
                    <CacheProvider value={emotionCache}>
                        <ThemeProvider>
                            <PortalContainerContext.Provider value={portalContainerRef.current}>
                                <WrappedComponent {...(props as P)} />
                            </PortalContainerContext.Provider>
                        </ThemeProvider>
                    </CacheProvider>
                );
            }

        }, [props]);

        return <div ref={hostRef} />;
    };
};

export default withShadowDOM;
