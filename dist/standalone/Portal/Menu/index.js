import React, { useState } from "react";
import { MenuContext, toMenuItemComponent } from "./MenuItem";
import { makeStyles } from "@mui/styles";
import { combineClassNames } from "../../../utils";
const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.componentsCare?.portal?.menu?.container?.padding,
        height: theme.componentsCare?.portal?.menu?.container?.height || "100%",
        width: theme.componentsCare?.portal?.menu?.container?.width || "100%",
        overflow: theme.componentsCare?.portal?.menu?.container?.overflow || "auto",
        ...theme.componentsCare?.portal?.menu?.container?.style,
    },
}), { name: "CcPortalMenu" });
const PortalMenu = (props) => {
    const Wrapper = props.wrapper;
    const state = useState("");
    const classes = useStyles(props);
    return (React.createElement("div", { className: combineClassNames([classes.root, props.className]) },
        React.createElement(Wrapper, null,
            React.createElement(MenuContext.Provider, { value: props.customState || state }, props.definition.map((child) => toMenuItemComponent(props, child, 0, null))))));
};
export default React.memo(PortalMenu);
