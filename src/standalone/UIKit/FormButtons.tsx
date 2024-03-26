import React from "react";
import { styled, Unstable_Grid2 as Grid, useThemeProps } from "@mui/material";
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
	"&:first-child": {
		marginLeft: 0,
	},
	"&:last-child": {
		marginRight: 0,
	},
}));

export type FormButtonsClassKey = "root" | "buttonWrapper";

export interface FormButtonsProps {
	/**
	 * Action buttons (used on form)
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
	const children = (
		Array.isArray(props.children) ? props.children : [props.children]
	).filter((child) => child !== undefined && child !== null && child !== false);

	if (children.length === 0) return <></>;

	return (
		<Container
			container
			direction="row"
			spacing={2}
			wrap={"nowrap"}
			className={combineClassNames([props.classes?.root, props.className])}
		>
			{children.map((child: React.ReactNode, index: number) => {
				return (
					<ButtonWrapper key={index} className={props.classes?.buttonWrapper}>
						{child}
					</ButtonWrapper>
				);
			})}
		</Container>
	);
};

export default React.memo(FormButtons);
