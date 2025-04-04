import React from "react";
import { Tooltip as MuiTooltip, TooltipProps } from "@mui/material";
import { usePortalContainer } from "../shadow/PortalContainerContext";

const Tooltip = (props: TooltipProps) => {
    const container = usePortalContainer();

    return (
        <MuiTooltip
            {...props}
            PopperProps={{
                ...props.PopperProps,
                container: container,
            }}
        />
    );
};

export default Tooltip;
