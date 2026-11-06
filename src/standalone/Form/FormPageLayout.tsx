import { styled, useThemeProps } from "@mui/material";
import React from "react";
import combineClassNames from "../../utils/combineClassNames";

export interface FormPageLayoutProps {
	body: React.ReactNode;
	footer: React.ReactNode;
	other?: React.ReactNode;
	/**
	 * class name to apply to root
	 */
	className?: string;
	/**
	 * custom CSS classes
	 */
	classes?: Partial<Record<FormPageLayoutClassKey, string>>;
}

const Root = styled("div", { name: "CcFormPageLayout", slot: "root" })({
	flexGrow: 1,
	display: "flex",
	flexDirection: "column",
});

const Wrapper = styled("div", { name: "CcFormPageLayout", slot: "wrapper" })({
	flexGrow: 1,
	display: "flex",
	flexDirection: "column",
});

const Body = styled("div", { name: "CcFormPageLayout", slot: "body" })({
	paddingBottom: 150,
	flexGrow: 1,
	display: "flex",
	flexDirection: "column",
	// Its own stacking context, so the footer, which floats over the body and comes
	// after it, paints above all of the body's content and gets every click in its
	// area: also content with a z-index of its own, such as outlined field labels,
	// badges or the DataGrid's settings panel. Unlike a z-index on the footer, this
	// leaves the footer below the busy overlay (`other`) and app-level layers.
	isolation: "isolate",
});

const Footer = styled("div", { name: "CcFormPageLayout", slot: "footer" })({
	position: "absolute",
	bottom: 36,
	transform: "translateX(36px)",
	padding: 0,
});

export type FormPageLayoutClassKey = "root" | "wrapper" | "body" | "footer";

const FormPageLayout = (inProps: FormPageLayoutProps) => {
	const props = useThemeProps({ props: inProps, name: "CcFormPageLayout" });
	const { body, footer, other, className, classes } = props;

	return (
		<Root className={combineClassNames([className, classes?.root])}>
			<Wrapper className={classes?.wrapper}>
				<Body className={classes?.body}>{body}</Body>
				<Footer className={classes?.footer}>{footer}</Footer>
			</Wrapper>
			{other}
		</Root>
	);
};

export default React.memo(FormPageLayout);
