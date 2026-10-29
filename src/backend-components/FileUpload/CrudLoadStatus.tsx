import React from "react";
import {
	CircularProgress,
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";
import GroupBox from "../../standalone/GroupBox";
import useCCTranslations from "../../utils/useCCTranslations";

export interface CrudLoadStatusProps {
	/**
	 * The field's label, as the loaded field shows it
	 */
	label: React.ReactNode;
	/**
	 * @see GroupBoxProps.smallLabel
	 */
	smallLabel?: boolean;
	/**
	 * CSS class of the frame, as the loaded field gets it
	 */
	className?: string;
	/**
	 * What the field lists, which names what could not be loaded
	 */
	kind: "files" | "images";
	/**
	 * Why the load failed, if it did: shown in place of the spinner
	 */
	error?: Error | null;
	/**
	 * Custom CSS classes
	 */
	classes?: Partial<Record<CrudLoadStatusClassKey, string>>;
}

export type CrudLoadStatusClassKey = "message" | "detail";

const Message = styled(Typography, {
	name: "CcCrudLoadStatus",
	slot: "message",
})({});

// a backend's message can be a code or a URL without break opportunities
const Detail = styled(Typography, {
	name: "CcCrudLoadStatus",
	slot: "detail",
})({
	overflowWrap: "anywhere",
});

/**
 * The frame of a field whose records are still being loaded, or failed to load
 * @remarks Keeps the field's label in place, so that assistive technology can tell which
 *          field is loading (`aria-busy`, a named spinner) and which one failed (an
 *          alert), and the layout does not jump by the field's height when it is done.
 */
const CrudLoadStatus = (inProps: CrudLoadStatusProps) => {
	const props = useThemeProps({ props: inProps, name: "CcCrudLoadStatus" });
	const { label, smallLabel, className, kind, error, classes } = props;
	const { t } = useCCTranslations();
	return (
		<GroupBox
			label={label}
			smallLabel={smallLabel}
			className={className}
			busy={!error}
		>
			{error ? (
				<div role={"alert"}>
					<Message className={classes?.message}>
						{t(`backend-components.file-upload.load-failed.${kind}`)}
					</Message>
					{error.message && (
						<Detail
							variant={"body2"}
							color={"textSecondary"}
							className={classes?.detail}
						>
							{error.message}
						</Detail>
					)}
				</div>
			) : (
				<CircularProgress
					aria-label={t("backend-components.file-upload.loading")}
				/>
			)}
		</GroupBox>
	);
};

export default React.memo(CrudLoadStatus);
