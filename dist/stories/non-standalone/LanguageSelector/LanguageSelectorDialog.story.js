import React from "react";
import { Button } from "@material-ui/core";
import { useDialogContext } from "../../..";
import LanguageSelectorDialog from "../../../non-standalone/LanguageSelector/LanguageSelectorDialog";
export var LanguageSelectorDialogStory = function () {
    var pushDialog = useDialogContext()[0];
    return (React.createElement(Button, { onClick: function () { return pushDialog(React.createElement(LanguageSelectorDialog, null)); } }, "Open"));
};
LanguageSelectorDialogStory.storyName = "LanguageSelectorDialog";
