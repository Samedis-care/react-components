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
