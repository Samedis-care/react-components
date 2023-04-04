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
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import DayContents from "../Common/DayContents";
import { createStyles, withStyles } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import moment from "moment";
import { combineClassNames } from "../../../utils";
var WeekViewDay = /** @class */ (function (_super) {
    __extends(WeekViewDay, _super);
    function WeekViewDay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WeekViewDay.prototype.render = function () {
        var isFirst = this.props.dayIdx === 0;
        var isLast = this.props.dayIdx === 6;
        var isToday = this.props.day.dayOfYear() === moment().dayOfYear() &&
            this.props.day.year() === moment().year();
        return (React.createElement(Grid, { item: true, xs: true },
            React.createElement(Paper, { square: true, elevation: 0, className: combineClassNames([
                    isToday && this.props.classes.today,
                    this.props.classes.paper,
                    isFirst && this.props.classes.first,
                    isLast && this.props.classes.last,
                ]) },
                React.createElement(Grid, { container: true },
                    React.createElement(Grid, { item: true, xs: 12 },
                        React.createElement(Typography, { align: "center" }, this.props.day.format("dddd"))),
                    React.createElement(Grid, { item: true, xs: 12 },
                        React.createElement(Divider, null)),
                    React.createElement(Grid, { item: true, xs: 12 },
                        React.createElement(Box, { m: 1 }, this.props.date)),
                    React.createElement(Grid, { item: true, xs: 12 },
                        React.createElement(Box, { m: 1 },
                            React.createElement(DayContents, { data: this.props.data })))))));
    };
    return WeekViewDay;
}(PureComponent));
var styles = createStyles(function (theme) { return ({
    paper: {
        height: "100%",
    },
    today: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.getContrastText(theme.palette.primary.main),
    },
    first: {
        borderRadius: "".concat(theme.shape.borderRadius, "px 0 0 ").concat(theme.shape.borderRadius, "px"),
    },
    last: {
        borderRadius: "0 ".concat(theme.shape.borderRadius, "px ").concat(theme.shape.borderRadius, "px 0"),
    },
}); });
export default withStyles(styles)(WeekViewDay);
