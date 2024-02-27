import React, { CSSProperties } from "react";
import SignalPortletItem, { SignalPortletItemDef } from "./SignalPortletItem";
import {
	Divider,
	Grid,
	List,
	Paper,
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";

export interface SignalPortletColorConfig {
	/**
	 * Color used for counter if count != 0
	 */
	colorPresent: NonNullable<CSSProperties["color"]>;
	/**
	 * Color used for counter if count == 0
	 */
	colorNotPresent: NonNullable<CSSProperties["color"]>;
}

export interface SignalPortletProps extends SignalPortletColorConfig {
	/**
	 * The title of the portlet
	 */
	title: React.ReactNode;
	/**
	 * The portlet items
	 */
	items: SignalPortletItemDef[];
	/**
	 * Custom CSS classes
	 */
	classes?: Partial<Record<SignalPortletClassKey, string>>;
}

const SignalPortletRoot = styled("div", {
	name: "CcSignalPortlet",
	slot: "paper",
})({});
const SignalPortletPaper = styled(Paper, {
	name: "CcSignalPortlet",
	slot: "paper",
})({
	height: "100%",
});
const SignalPortletDivider = styled(Grid, {
	name: "CcSignalPortlet",
	slot: "divider",
})({});
const SignalPortletTitleWrapper = styled(Grid, {
	name: "CcSignalPortlet",
	slot: "titleWrapper",
})({});
const SignalPortletTitle = styled(Typography, {
	name: "CcSignalPortlet",
	slot: "title",
})({});
const SignalPortletList = styled(List, {
	name: "CcSignalPortlet",
	slot: "list",
})({});

export type SignalPortletClassKey =
	| "paper"
	| "divider"
	| "titleWrapper"
	| "title"
	| "list";

const SignalPortlet = (inProps: SignalPortletProps) => {
	const props = useThemeProps({ props: inProps, name: "CcSignalPortlet" });

	return (
		<SignalPortletRoot>
			<SignalPortletPaper className={props.classes?.paper}>
				<Grid container spacing={1}>
					<SignalPortletTitleWrapper
						item
						xs={12}
						className={props.classes?.titleWrapper}
					>
						<SignalPortletTitle
							variant={"h5"}
							align={"center"}
							className={props.classes?.title}
						>
							{props.title}
						</SignalPortletTitle>
					</SignalPortletTitleWrapper>
					<SignalPortletDivider item xs={12} className={props.classes?.divider}>
						<Divider />
					</SignalPortletDivider>
					<Grid item xs={12}>
						<SignalPortletList className={props.classes?.list}>
							{props.items.map((item, index) => (
								<SignalPortletItem
									key={index.toString()}
									colorPresent={props.colorPresent}
									colorNotPresent={props.colorNotPresent}
									{...item}
								/>
							))}
						</SignalPortletList>
					</Grid>
				</Grid>
			</SignalPortletPaper>
		</SignalPortletRoot>
	);
};

export default React.memo(SignalPortlet);
