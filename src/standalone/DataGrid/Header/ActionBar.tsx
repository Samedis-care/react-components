import React, { useCallback, useContext } from "react";
import { DataGridStateContext } from "../index";
import ActionBarView from "./ActionBarView";

export default React.memo(() => {
	const [, setState] = useContext(DataGridStateContext)!;

	const toggleSettings = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			showSettings: !prevState.showSettings,
		}));
	}, [setState]);

	return <ActionBarView toggleSettings={toggleSettings} />;
});
