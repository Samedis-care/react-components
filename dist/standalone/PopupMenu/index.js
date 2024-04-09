import { Menu, styled } from "@mui/material";
const PopupMenu = styled(Menu, { name: "CcPopupMenu", slot: "root" })(({ theme }) => ({
    "& .MuiMenu-paper": {
        border: `1px solid ${theme.palette.divider}`,
    },
}));
export default PopupMenu;
