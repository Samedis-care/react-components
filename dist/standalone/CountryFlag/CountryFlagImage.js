import { styled } from "@mui/material";
/**
 * The `image` slot of CountryFlag: the flag as large as fits into the root's
 * box, in its own aspect ratio, so the outline hugs the flag. The outline in
 * `theme.palette.divider` keeps the shape of a flag whose edge has the color
 * of the background (Japan's white, Germany's black in dark mode).
 */
const CountryFlagImage = styled("img", {
    name: "CcCountryFlag",
    slot: "image",
})(({ theme }) => ({
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
    outline: `1px solid ${theme.palette.divider}`,
}));
export default CountryFlagImage;
