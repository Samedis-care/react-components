import React, { Dispatch, SetStateAction, useState } from "react";
import { IFrameworkProps } from "./Framework";

export type DialogType = React.ReactNode | null;

/**
 * Context for the dialog state
 */
export const DialogContext = React.createContext<
	[DialogType, Dispatch<SetStateAction<DialogType>>] | undefined
>(undefined);

/**
 * Provides the application with an state to display an dialog
 */
export default React.memo((props: IFrameworkProps) => {
	const dialogState = useState<DialogType>(null);

	return (
		<>
			<DialogContext.Provider value={dialogState}>
				{props.children}
			</DialogContext.Provider>
			<>{dialogState[0]}</>
		</>
	);
});
