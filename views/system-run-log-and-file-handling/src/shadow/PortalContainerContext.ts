import { createContext, useContext } from "react";

export const PortalContainerContext = createContext<HTMLElement | null>(null);

export const usePortalContainer = () => {
    return useContext(PortalContainerContext);
};
