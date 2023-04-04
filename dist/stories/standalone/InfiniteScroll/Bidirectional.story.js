var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useState } from "react";
import InfiniteScroll from "../../../standalone/InfiniteScroll";
import { Grid, makeStyles } from "@material-ui/core";
import { number } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
var useStyles = makeStyles({
    scrollWrapper: {
        height: "50vh",
        width: "100%",
        overflow: "auto",
        border: "1px solid red",
    },
}, { name: "CcBidirectionalStory" });
var debounceWaitKnobOptions = {
    range: true,
    min: 0,
    max: 1500,
    step: 1,
};
export var Bidirectional = function () {
    var classes = useStyles();
    var _a = useState([]), items = _a[0], setItems = _a[1];
    var loadMoreTopAction = action("load-more-top");
    var loadMoreBottomAction = action("load-more-bottom");
    return (React.createElement(Grid, { container: true },
        React.createElement(InfiniteScroll, { className: classes.scrollWrapper, loadMoreTop: function () {
                loadMoreTopAction();
                setItems(function (prevItems) { return __spreadArray([
                    React.createElement(Grid, { item: true, xs: 12, key: Math.random() }, prevItems.length)
                ], prevItems, true); });
            }, loadMoreBottom: function () {
                loadMoreBottomAction();
                setItems(function (prevItems) { return __spreadArray(__spreadArray([], prevItems, true), [
                    React.createElement(Grid, { item: true, xs: 12, key: Math.random() }, prevItems.length),
                ], false); });
            }, callBackDebounce: number("Debounce wait", 100, debounceWaitKnobOptions) }, items)));
};
Bidirectional.storyName = "Bidirectional";
