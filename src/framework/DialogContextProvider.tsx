import React, { useCallback, useContext, useMemo, useState } from "react";
import { IFrameworkProps } from "./Framework";

export type DialogType = React.ReactNode;
export type DialogContextType = [
	pushDialog: (dialog: React.ReactNode) => void,
	popDialog: () => void
];

/**
 * Context for the dialog state
 */
export const DialogContext = React.createContext<DialogContextType | undefined>(
	undefined
);

export const useDialogContext = (): DialogContextType => {
	const ctx = useContext(DialogContext);
	if (!ctx)
		throw new Error(
			"DialogContext is missing, did you forget to add Components-Care Framework or DialogContextProvider?"
		);
	return ctx;
};

/**
 * Provides the application with an state to display an dialog
 */
const DialogContextProvider = (props: IFrameworkProps) => {
	const [dialogs, setDialogs] = useState<DialogType[]>([]);

	const pushDialog = useCallback(
		(dialog: React.ReactNode) => {
			setDialogs((prevValue) => prevValue.concat([dialog]));
		},
		[setDialogs]
	);
	const popDialog = useCallback(() => {
		setDialogs((prevValue) => {
			prevValue.pop();
			return [...prevValue];
		});
	}, [setDialogs]);

	const dialogActions: DialogContextType = useMemo(
		() => [pushDialog, popDialog],
		[pushDialog, popDialog]
	);

	return (
		<>
			<DialogContext.Provider value={dialogActions}>
				<>{props.children}</>
				<>
					{dialogs.map((dialog, index) => (
						<React.Fragment key={index.toString()}>{dialog}</React.Fragment>
					))}
				</>
			</DialogContext.Provider>
		</>
	);
};

export default React.memo(DialogContextProvider);
