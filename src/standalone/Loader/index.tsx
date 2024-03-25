import React from "react";
import {
	CircularProgress,
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";
import { Variant } from "@mui/material/styles/createTypography";

export interface LoaderProps {
	/**
	 * Optional status message to show
	 */
	text?: string;
	/**
	 * Typography variant to use for text
	 */
	typographyVariant?: Variant;
}

const OuterWrapper = styled("div", { name: "CcLoader", slot: "outerWrapper" })({
	height: "100%",
	position: "relative",
	width: "100%",
});

const InnerWrapper = styled("div", { name: "CcLoader", slot: "innerWrapper" })({
	height: 70,
	left: "50%",
	position: "absolute",
	textAlign: "center",
	top: "50%",
	transform: "translate(-50%, -50%)",
	width: "100%",
});

const OuterProgressWrapper = styled("div", {
	name: "CcLoader",
	slot: "outerProgressWrapper",
})({
	height: "100%",
	position: "relative",
	width: "100%",
});

const InnerProgressWrapper = styled("div", {
	name: "CcLoader",
	slot: "innerProgressWrapper",
})({
	left: "50%",
	position: "absolute",
	top: "50%",
	transform: "translate(-50%, -50%)",
});

const Progress = styled(CircularProgress, {
	name: "CcLoader",
	slot: "progress",
})({});

export type LoaderClassKey =
	| "outerWrapper"
	| "innerWrapper"
	| "outerProgressWrapper"
	| "innerProgressWrapper"
	| "progress";

const Loader = (inProps: LoaderProps) => {
	const props = useThemeProps({ props: inProps, name: "CcLoader" });

	return (
		<OuterWrapper>
			<InnerWrapper>
				{props.text && <Typography variant={"h6"}>{props.text}</Typography>}
				<OuterProgressWrapper>
					<InnerProgressWrapper>
						<Progress />
					</InnerProgressWrapper>
				</OuterProgressWrapper>
			</InnerWrapper>
		</OuterWrapper>
	);
};

export default React.memo(Loader);
