import React from "react";
import { FormHelperText } from "@mui/material";
import useCCTranslations from "../../utils/useCCTranslations";

export interface CrudSelectLoadStateProps {
	/**
	 * Whether the selection is still being loaded
	 */
	loading: boolean;
	/**
	 * The error the load of the selection failed with, or null
	 */
	loadError: Error | null;
	/**
	 * The field's label, which the failure message names; undefined for a field without
	 * a label
	 */
	label: string | undefined;
}

/**
 * The line under a CRUD select's field that says its selection is loading (a status), or
 * that loading it failed (an alert, announced once). Renders nothing once the selection
 * is loaded. The error itself is not shown: its message is technical.
 */
const CrudSelectLoadState = (props: CrudSelectLoadStateProps) => {
	const { loading, loadError, label } = props;
	const { t } = useCCTranslations();

	if (loading)
		return (
			<FormHelperText role={"status"}>
				{t("backend-components.selector.loading")}
			</FormHelperText>
		);
	if (loadError)
		return (
			<FormHelperText error role={"alert"}>
				{label
					? t("backend-components.selector.selection-load-error", {
							LABEL: label,
						})
					: t("backend-components.selector.selection-load-error-unlabelled")}
			</FormHelperText>
		);
	return null;
};

export default React.memo(CrudSelectLoadState);
