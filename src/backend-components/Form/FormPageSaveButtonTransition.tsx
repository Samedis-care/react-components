import React, { useState } from "react";
import { Grow, GrowProps } from "@mui/material";

/**
 * The transition of FormPageSaveButton's reason tooltip: MUI's Grow, the Tooltip's default,
 * which keeps showing what it showed while open until it has closed.
 *
 * When a save ends, the reason ("The form is currently being saved") and with it the Tooltip's
 * title turn empty, and MUI closes a Tooltip with an empty title at once. The bubble it then
 * fades out would be empty: a blank flash, and a `role="tooltip"` without a name. This keeps
 * the bubble's last content for that fade-out. Opened again during it, it shows the current
 * content.
 */
const FormPageSaveButtonTransition = (
	props: GrowProps,
	ref: React.ForwardedRef<unknown>,
) => {
	const { in: open, children, ...growProps } = props;
	// the content of the last render while open
	const [openContent, setOpenContent] = useState(children);
	if (open && openContent !== children) setOpenContent(children);

	return (
		<Grow {...growProps} in={open} ref={ref}>
			{open ? children : openContent}
		</Grow>
	);
};

export default React.memo(React.forwardRef(FormPageSaveButtonTransition));
