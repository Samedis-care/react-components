import React, { useEffect, useState } from "react";
import { FormHelperText } from "@mui/material";
import useCCTranslations from "../../utils/useCCTranslations";

/**
 * How long the status region is in the page before it says "Loading…", in ms. A screen
 * reader announces a change of a live region's text, but not every one announces a region
 * that comes with its text, and it picks up a new region with a delay: react-aria's live
 * announcer waits as long before it fills a new region, as text set sooner was not
 * announced consistently.
 */
const LOADING_DELAY = 100;

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
	/**
	 * Whether a change of the loaded selection is being written (UseCrudSelectResult.writing)
	 */
	writing: boolean;
}

/**
 * The lines under a CRUD select's field.
 *
 * A status region (`role="status"`), rendered as long as the field and the same element
 * all along, so that a screen reader announces each of its texts: "Loading…" while the
 * selection loads, from 100ms after the field mounted on (a load that takes less shows
 * nothing), "Saving…" while a change of it is being written, and nothing otherwise. Empty,
 * it takes no room.
 *
 * After it, when loading the selection failed, an alert that names the field (announced as
 * it is added). The error itself is not shown: its message is technical.
 */
const CrudSelectLoadState = (props: CrudSelectLoadStateProps) => {
	const { loading, loadError, label, writing } = props;
	const { t } = useCCTranslations();

	// whether the status region has been in the page for LOADING_DELAY
	const [regionSettled, setRegionSettled] = useState(false);
	useEffect(() => {
		const timer = setTimeout(() => setRegionSettled(true), LOADING_DELAY);
		return () => clearTimeout(timer);
	}, []);

	// the alert speaks for a failed load
	let status = "";
	if (loading) {
		if (regionSettled) status = t("backend-components.selector.loading");
	} else if (writing && !loadError) {
		status = t("backend-components.selector.saving");
	}

	return (
		<>
			<div role={"status"}>
				{status && <FormHelperText>{status}</FormHelperText>}
			</div>
			{!loading && loadError && (
				<FormHelperText error role={"alert"}>
					{label
						? t("backend-components.selector.selection-load-error", {
								LABEL: label,
							})
						: t("backend-components.selector.selection-load-error-unlabelled")}
				</FormHelperText>
			)}
		</>
	);
};

export default React.memo(CrudSelectLoadState);
