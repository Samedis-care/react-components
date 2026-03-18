import React, { useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@mui/material";
import DialogContextProvider from "../../framework/DialogContextProvider";
import { useDialogContext } from "../../framework";
import LocaleSelectorDialog from "./LocaleSelectorDialog";
import { setFrameworkHistory } from "../../framework/History";
import { createMemoryHistory } from "history";

setFrameworkHistory(createMemoryHistory());

const DialogDecorator = (Story: React.ComponentType) => (
	<DialogContextProvider>
		<Story />
	</DialogContextProvider>
);

const meta: Meta = {
	title: "non-standalone/LocaleSelector",
	decorators: [DialogDecorator],
	parameters: { layout: "centered" },
};

export default meta;

// ─── Default (all locales) ───────────────────────────────────────────────────

const LocaleSelectorAllDemo = () => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(() => {
		pushDialog(<LocaleSelectorDialog />);
	}, [pushDialog]);
	return (
		<Button variant="contained" onClick={open}>
			Open Locale Selector (all locales)
		</Button>
	);
};

export const AllLocales: StoryObj = {
	render: () => <LocaleSelectorAllDemo />,
};

// ─── Filtered locales ────────────────────────────────────────────────────────

const LocaleSelectorFilteredDemo = () => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(() => {
		pushDialog(<LocaleSelectorDialog supportedLocales={["en", "de", "fr"]} />);
	}, [pushDialog]);
	return (
		<Button variant="contained" onClick={open}>
			Open Locale Selector (en, de, fr)
		</Button>
	);
};

export const FilteredLocales: StoryObj = {
	render: () => <LocaleSelectorFilteredDemo />,
};
