import makeStyles from "@mui/styles/makeStyles";
import makeThemeStyles from "../../utils/makeThemeStyles";
import useMultipleStyles from "../../utils/useMultipleStyles";
const useThemeStyles = makeThemeStyles((theme) => theme.componentsCare?.uiKit?.input, "CcUIKitInput");
const useRawInputStyles = makeStyles((theme) => ({
    root: {
        paddingTop: 0,
        paddingRight: theme.spacing(2),
        paddingBottom: 0,
        paddingLeft: theme.spacing(2),
        "& .MuiAutocomplete-endAdornment": {
            right: theme.spacing(2),
        },
    },
    input: (props) => ({
        "&::placeholder": {
            color: props.important ? theme.palette.error.main : undefined,
        },
    }),
    multiline: {
        padding: theme.spacing(2),
    },
}), { name: "CcUIKitInput" });
export const useInputStyles = (props) => {
    return useMultipleStyles(props, useThemeStyles, useRawInputStyles);
};
export const InputLabelConfig = {
    shrink: true,
};
