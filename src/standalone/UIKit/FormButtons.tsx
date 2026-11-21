import React from "react";
import { styled, Grid, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";

const Container = styled(Grid, { name: "CcFormButtons", slot: "root" })(
	({ theme }) => ({
		padding: theme.spacing(3),
		backgroundColor: theme.palette.background.paper,
	}),
);

const ButtonWrapper = styled(Grid, {
	name: "CcFormButtons",
	slot: "buttonWrapper",
})(({ theme }) => ({
	margin: theme.spacing(0, 1, 0, 0),
	"&:first-of-type": {
		marginLeft: 0,
	},
	"&:last-of-type": {
		marginRight: 0,
	},
}));

/**
 * Keys of the theme's `components.CcFormButtons.styleOverrides`, also the
 * keys of the `classes` prop:
 * - `root`: the bar, a Grid container
 * - `buttonWrapper`: the Grid item around each button
 *
 * No slot receives an `ownerState`: a function override is called with the
 * theme. FormButtons has no theme `variants`.
 */
export type FormButtonsClassKey = "root" | "buttonWrapper";

export interface FormButtonsProps {
	/**
	 * The action buttons, each in its own slot, in order. Arrays are flattened, and
	 * `null`, `undefined` and booleans get no slot, so conditional buttons can be
	 * written inline (`{canDelete && <ActionButton … />}`). A slot is keyed by its
	 * button's `key`, or by the button's position among the children, so a button
	 * keeps its DOM node (and focus) when a conditional button before it
	 * disappears. Buttons in an array need unique keys.
	 */
	children: React.ReactNode | React.ReactNode[];
	/**
	 * custom CSS class to apply to root
	 */
	className?: string;
	/**
	 * custom CSS classes to apply
	 */
	classes?: Partial<Record<FormButtonsClassKey, string>>;
}

const FormButtons = (inProps: FormButtonsProps) => {
	const props = useThemeProps({ props: inProps, name: "CcFormButtons" });
	// flat, without null, undefined and booleans, each element keyed by its own key
	// or its original position, so a removed button does not shift the others' slots
	const children = React.Children.toArray(props.children);

	if (children.length === 0) return <></>;

	return (
		<Container
			container
			direction="row"
			spacing={2}
			// buttons that do not fit on one line wrap onto the next, rather than
			// running out of their container (a form page's footer on a 320px phone)
			wrap={"wrap"}
			className={combineClassNames([props.classes?.root, props.className])}
		>
			{children.map((child, index) => (
				<ButtonWrapper
					key={React.isValidElement(child) ? child.key : index}
					className={props.classes?.buttonWrapper}
				>
					{child}
				</ButtonWrapper>
			))}
		</Container>
	);
};

/**
 * A bar of form action buttons, each in its own slot, in order. The buttons share
 * one line and wrap onto further lines when they do not fit, as on a 320px phone.
 */
export default React.memo(FormButtons);
