import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import makeThemeStyles from "../../utils/makeThemeStyles";
const useStyles = makeStyles({
    wrapper: {
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
    },
    box: {
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
    },
    body: {
        paddingBottom: 150,
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
    },
    footer: {
        position: "absolute",
        bottom: 36,
        transform: "translateX(36px)",
        padding: 0,
    },
}, { name: "CcFormPageLayout" });
const useThemeStyles = makeThemeStyles((theme) => theme.componentsCare?.uiKit?.formPage?.layout, "CcFormPageLayout", useStyles);
const FormPageLayout = (props) => {
    const classes = useThemeStyles(props);
    return (React.createElement("div", { className: classes.box },
        React.createElement("div", { className: classes.wrapper },
            React.createElement("div", { className: classes.body }, props.body),
            React.createElement("div", { className: classes.footer }, props.footer)),
        props.other));
};
export default React.memo(FormPageLayout);
