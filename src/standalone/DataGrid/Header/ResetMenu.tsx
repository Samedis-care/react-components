import React, { useCallback } from "react";
import { MenuItem, MenuProps, PopoverOrigin } from "@material-ui/core";
import useCCTranslations from "../../../utils/useCCTranslations";
import PopupMenu from "../../PopupMenu";

/**
 * Reset button callbacks
 */
export interface ResetCallbacks {
	resetFilter: () => void;
	resetSort: () => void;
	resetColumn: () => void;
	resetWidth: () => void;
	resetAll: () => void;
}

export interface ResetMenuProps extends ResetCallbacks {
	/**
	 * The menu anchor
	 */
	anchorEl: MenuProps["anchorEl"];
	/**
	 * The menu onClose handler
	 */
	onClose: () => void;
}

const anchorOrigin: PopoverOrigin = {
	vertical: "bottom",
	horizontal: "center",
};

const transformOrigin: PopoverOrigin = {
	vertical: "top",
	horizontal: "center",
};

const ResetMenu = (props: ResetMenuProps) => {
	const { t } = useCCTranslations();
	const {
		anchorEl,
		onClose,
		resetFilter,
		resetSort,
		resetColumn,
		resetWidth,
		resetAll,
	} = props;

	const resetFilterAndClose = useCallback(() => {
		resetFilter();
		onClose();
	}, [resetFilter, onClose]);
	const resetSortAndClose = useCallback(() => {
		resetSort();
		onClose();
	}, [resetSort, onClose]);
	const resetColumnAndClose = useCallback(() => {
		resetColumn();
		onClose();
	}, [resetColumn, onClose]);
	const resetWidthAndClose = useCallback(() => {
		resetWidth();
		onClose();
	}, [resetWidth, onClose]);
	const resetAllAndClose = useCallback(() => {
		resetAll();
		onClose();
	}, [resetAll, onClose]);

	return (
		<PopupMenu
			elevation={0}
			anchorEl={anchorEl}
			anchorOrigin={anchorOrigin}
			transformOrigin={transformOrigin}
			keepMounted
			getContentAnchorEl={null}
			open={!!anchorEl}
			onClose={onClose}
		>
			<MenuItem onClick={resetFilterAndClose}>
				{t("standalone.data-grid.header.reset-options.filter")}
			</MenuItem>
			<MenuItem onClick={resetSortAndClose}>
				{t("standalone.data-grid.header.reset-options.sort")}
			</MenuItem>
			<MenuItem onClick={resetColumnAndClose}>
				{t("standalone.data-grid.header.reset-options.column")}
			</MenuItem>
			<MenuItem onClick={resetWidthAndClose}>
				{t("standalone.data-grid.header.reset-options.width")}
			</MenuItem>
			<MenuItem onClick={resetAllAndClose}>
				{t("standalone.data-grid.header.reset-options.all")}
			</MenuItem>
		</PopupMenu>
	);
};

export default React.memo(ResetMenu);
