import { buttonBaseClasses, IconButton, styled, Theme } from "@mui/material";

// MUI shows keyboard focus on an IconButton only as a faint ripple, which forced colors drop
const focusRing = (theme: Theme, offset: number) => ({
	[`&.${buttonBaseClasses.focusVisible}`]: {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: offset,
	},
});

export const SmallIconButton = styled(IconButton)(({ theme }) => ({
	padding: 4,
	...focusRing(theme, 0),
})) as typeof IconButton;

// without padding the button is the icon's box, so the ring keeps clear of the glyph
export const SmallestIconButton = styled(IconButton)(({ theme }) => ({
	padding: 0,
	...focusRing(theme, 2),
})) as typeof IconButton;
