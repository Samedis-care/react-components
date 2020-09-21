import React, { Dispatch, SetStateAction, useState } from "react";
import { IFrameworkProps } from "./Framework";

export type DialogType = React.ReactNode | null;
export type DialogContextType = [
	DialogType,
	Dispatch<SetStateAction<DialogType>>
];

/**
 * Context for the dialog state
 */
export const DialogContext = React.createContext<DialogContextType | undefined>(
	undefined
);

/**
 * Provides the application with an state to display an dialog
 */
const DialogContextProvider = (props: IFrameworkProps) => {
	const dialogState = useState<DialogType>(null);

	return (
		<>
			<DialogContext.Provider value={dialogState}>
				<>{props.children}</>
				<>{dialogState[0]}</>
			</DialogContext.Provider>
		</>
	);
};

export default React.memo(DialogContextProvider);
