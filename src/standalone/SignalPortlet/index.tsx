import React from "react";
import SignalPortletItem, { SignalPortletItemProps } from "./SignalPortletItem";
import {
	Divider,
	Grid,
	List,
	Paper,
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";

export interface SignalPortletProps {
	/**
	 * The title of the portlet
	 */
	title: React.ReactNode;
	/**
	 * The portlet items
	 */
	items: SignalPortletItemProps[];
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
const SignalPortletItemStyled = styled(SignalPortletItem, {
	name: "CcSignalPortlet",
	slot: "item",
})({});

export type SignalPortletClassKey =
	| "paper"
	| "divider"
	| "titleWrapper"
	| "title"
	| "list"
	| "item";

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
								<SignalPortletItemStyled
									key={index.toString()}
									className={props.classes?.item}
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
