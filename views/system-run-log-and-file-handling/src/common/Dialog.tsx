import React from "react";
import { Dialog as MUIDialog, DialogContent as MUIDialogContent } from "@mui/material";
import { usePortalContainer } from "../shadow/PortalContainerContext";

interface Props {
    children: React.ReactNode;
    onClose: () => void;
}

const Dialog = ({ children, onClose }: Props) => {
    const container = usePortalContainer();

    return (
        <MUIDialog open onClose={onClose} container={container}>
            <MUIDialogContent>{children}</MUIDialogContent>
        </MUIDialog>
    );
};

export default Dialog;
