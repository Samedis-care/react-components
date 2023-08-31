import { AppBar, IconButton, Toolbar, } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import React from "react";
const PortalLayoutHeader = (props) => {
    const { mobile, customClasses, toggleMenu, contents } = props;
    return (React.createElement(AppBar, { position: "relative", classes: customClasses?.appBar },
        React.createElement(Toolbar, { classes: customClasses?.toolbar },
            mobile && (React.createElement(IconButton, { onClick: toggleMenu, size: "large" },
                React.createElement(MenuIcon, null))),
            contents)));
};
export default React.memo(PortalLayoutHeader);
