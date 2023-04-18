import { AppBar, IconButton, Toolbar, } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import React from "react";
var PortalLayoutHeader = function (props) {
    var mobile = props.mobile, customClasses = props.customClasses, toggleMenu = props.toggleMenu, contents = props.contents;
    return (React.createElement(AppBar, { position: "relative", classes: customClasses === null || customClasses === void 0 ? void 0 : customClasses.appBar },
        React.createElement(Toolbar, { classes: customClasses === null || customClasses === void 0 ? void 0 : customClasses.toolbar },
            mobile && (React.createElement(IconButton, { onClick: toggleMenu, size: "large" },
                React.createElement(MenuIcon, null))),
            contents)));
};
export default React.memo(PortalLayoutHeader);
