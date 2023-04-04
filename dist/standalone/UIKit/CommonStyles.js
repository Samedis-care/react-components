import { makeStyles } from "@material-ui/core/styles";
import { makeThemeStyles, useMultipleStyles } from "../../utils";
var useThemeStyles = makeThemeStyles(function (theme) { var _a, _b; return (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.input; }, "CcUIKitInput");
var useRawInputStyles = makeStyles(function (theme) { return ({
    root: {
        paddingTop: 0,
        paddingRight: theme.spacing(2),
        paddingBottom: 0,
        paddingLeft: theme.spacing(2),
        "& .MuiAutocomplete-endAdornment": {
            right: theme.spacing(2),
        },
    },
    input: function (props) { return ({
        "&::placeholder": {
            color: props.important ? theme.palette.error.main : undefined,
        },
    }); },
    multiline: {
        padding: theme.spacing(2),
    },
}); }, { name: "CcUIKitInput" });
export var useInputStyles = function (props) {
    return useMultipleStyles(props, useThemeStyles, useRawInputStyles);
};
export var InputLabelConfig = {
    shrink: true,
};
