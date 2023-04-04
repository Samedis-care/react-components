import React from "react";
import BackendDataGrid from "../../../backend-components/DataGrid";
import TestModel from "./TestModel";
import { makeStyles } from "@material-ui/core/styles";
var useStyles = makeStyles({
    wrapper: {
        height: "75vh",
    },
}, { name: "CcDataGridStory" });
export var FormStory = function () {
    var classes = useStyles();
    return (React.createElement("div", { className: classes.wrapper },
        React.createElement(BackendDataGrid, { enableDelete: true, model: TestModel })));
};
FormStory.storyName = "DataGrid";
