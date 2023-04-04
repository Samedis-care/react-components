var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import React, { PureComponent } from "react";
import { Button, createStyles, Grid, withStyles, } from "@material-ui/core";
import { combineClassNames } from "../../../utils";
var DayContents = /** @class */ (function (_super) {
    __extends(DayContents, _super);
    function DayContents() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DayContents.prototype.render = function () {
        var _this = this;
        return (React.createElement(Grid, { container: true, spacing: 2 }, this.props.data.map(function (entry) { return (React.createElement(Grid, { item: true, xs: 12, key: entry.id },
            React.createElement(Button, { variant: "outlined", size: "small", fullWidth: true, className: combineClassNames([
                    _this.props.classes.btn,
                    !entry.onClick &&
                        !entry.onAuxClick &&
                        _this.props.classes.btnDisabled,
                ]), onClick: entry.onClick, onAuxClick: entry.onAuxClick, disableRipple: !entry.onClick && !entry.onAuxClick }, entry.title))); })));
    };
    return DayContents;
}(PureComponent));
var styles = createStyles({
    btn: {
        textTransform: "none",
        textAlign: "left",
        color: "inherit",
        display: "block",
    },
    btnDisabled: {
        cursor: "default",
    },
});
export default withStyles(styles)(DayContents);
