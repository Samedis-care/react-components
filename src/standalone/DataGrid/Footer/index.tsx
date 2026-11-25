import React from "react";
import { styled } from "@mui/material";
import Pagination from "./Pagination";
import StatusBar from "./DataActionBar";

/**
 * The footer's row: the action bar at its start, the count at its end. Both
 * are as tall as the row, so the action bar's dividers run from its top to its
 * bottom; neither shrinks below what its content needs, so they never overlap.
 */
const FooterRoot = styled("div")({
	display: "flex",
	justifyContent: "space-between",
});

const Footer = () => {
	return (
		<FooterRoot>
			<StatusBar />
			<Pagination />
		</FooterRoot>
	);
};

export default React.memo(Footer);
