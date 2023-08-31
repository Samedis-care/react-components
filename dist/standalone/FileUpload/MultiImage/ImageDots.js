import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { combineClassNames, makeThemeStyles } from "../../../utils";
const useStyles = makeStyles((theme) => ({
    activeImageDot: {
        backgroundColor: theme.palette.text.primary,
    },
    imageDot: {
        border: `1px solid ${theme.palette.text.primary}`,
        borderRadius: "100%",
        height: 12,
        width: 12,
        display: "inline-block",
        flex: "0 0 12px",
        marginRight: 12,
        cursor: "pointer",
    },
    imageDotContainerContainer: {
        overflow: "hidden",
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 16,
    },
    imageDotContainer: {
        marginRight: 12,
        marginLeft: 12,
        width: "100%",
        height: "100%",
        position: "absolute",
        whiteSpace: "nowrap",
    },
}), { name: "CcImageDots" });
const useThemeStyles = makeThemeStyles((theme) => theme.componentsCare?.fileUpload?.multiImage?.dots, "CcImageDots", useStyles);
const ImageDots = (props) => {
    const { total, active, setActive } = props;
    const classes = useThemeStyles(props);
    return (React.createElement(React.Fragment, null, total > 1 && (React.createElement("div", { className: classes.imageDotContainerContainer },
        React.createElement("div", { className: classes.imageDotContainer }, Array.from(Array(total).keys()).map((img, idx) => (React.createElement("div", { key: idx, className: combineClassNames([
                active === idx && classes.activeImageDot,
                classes.imageDot,
            ]), onClick: () => setActive(idx) }))))))));
};
export default React.memo(ImageDots);
