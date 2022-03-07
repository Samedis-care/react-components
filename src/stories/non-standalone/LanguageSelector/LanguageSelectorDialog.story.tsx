import React from "react";
import { Button } from "@material-ui/core";
import { useDialogContext } from "../../..";
import LanguageSelectorDialog from "../../../non-standalone/LanguageSelector/LanguageSelectorDialog";

export const LanguageSelectorDialogStory = (): React.ReactElement => {
	const [pushDialog] = useDialogContext();

	return (
		<Button onClick={() => pushDialog(<LanguageSelectorDialog />)}>Open</Button>
	);
};

LanguageSelectorDialogStory.storyName = "LanguageSelectorDialog";
