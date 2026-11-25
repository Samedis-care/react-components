import { Input, OutlinedInput, styled, TextField, } from "@mui/material";
import { PickersTextField } from "@mui/x-date-pickers";
const inputStyles = ({ theme }) => ({
    paddingTop: 0,
    paddingRight: theme.spacing(2),
    paddingBottom: 0,
    paddingLeft: theme.spacing(2),
    "& .MuiAutocomplete-endAdornment": {
        right: theme.spacing(2),
    },
    "& .MuiInput-multiline": {
        padding: theme.spacing(2),
    },
});
export const UiKitInput = styled(Input, {
    name: "CcUiKitInput",
    slot: "root",
})(inputStyles);
export const UiKitInputOutlined = styled(OutlinedInput, {
    name: "CcUiKitInputOutlined",
    slot: "root",
})(inputStyles);
export const UiKitTextField = styled(TextField, {
    name: "CcUiKitTextField",
    slot: "root",
})(({ theme }) => ({
    "& .MuiInput-root": inputStyles({ theme }),
}));
export const UiKitPickersTextField = styled(PickersTextField, {
    name: "CcUiKitPickersTextField",
    slot: "root",
})(({ theme }) => ({
    "& .MuiInput-root": inputStyles({ theme }),
}));
export const InputLabelConfig = {
    shrink: true,
};
