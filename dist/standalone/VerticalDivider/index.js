import { styled } from "@mui/material";
const VerticalDivider = styled("div", {
    name: "CcVerticalDivider",
    slot: "root",
})(({ theme }) => ({
    display: "inline-block",
    borderRight: `1px solid ${theme.palette.divider}`,
    height: "100%",
    padding: "0",
    margin: "0 4px",
}));
export default VerticalDivider;
