import { AppBar, IconButton, Toolbar, } from "@material-ui/core";
import { Menu as MenuIcon } from "@material-ui/icons";
import React from "react";
var PortalLayoutHeader = function (props) {
    var mobile = props.mobile, customClasses = props.customClasses, toggleMenu = props.toggleMenu, contents = props.contents;
    return (React.createElement(AppBar, { position: "relative", classes: customClasses === null || customClasses === void 0 ? void 0 : customClasses.appBar },
        React.createElement(Toolbar, { classes: customClasses === null || customClasses === void 0 ? void 0 : customClasses.toolbar },
            mobile && (React.createElement(IconButton, { onClick: toggleMenu },
                React.createElement(MenuIcon, null))),
            contents)));
};
export default React.memo(PortalLayoutHeader);
