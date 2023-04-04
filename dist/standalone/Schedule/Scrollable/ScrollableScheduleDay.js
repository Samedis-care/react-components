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
import { Grid } from "@material-ui/core";
import DayContents from "../Common/DayContents";
var ScrollableScheduleDay = /** @class */ (function (_super) {
    __extends(ScrollableScheduleDay, _super);
    function ScrollableScheduleDay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScrollableScheduleDay.prototype.render = function () {
        return (React.createElement(React.Fragment, null,
            React.createElement(Grid, { item: true, xs: 1, ref: this.props.refFwd }, this.props.moment.format("DD ddd")),
            React.createElement(Grid, { item: true, xs: 11 },
                React.createElement(DayContents, { data: this.props.data }))));
    };
    return ScrollableScheduleDay;
}(PureComponent));
export default ScrollableScheduleDay;
