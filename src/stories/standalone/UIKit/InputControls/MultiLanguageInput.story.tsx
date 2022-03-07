import React, { useState } from "react";
import MultiLanguageInput, {
	MultiLanguageInputSupportedLanguages,
} from "../../../../standalone/UIKit/InputControls/MultiLanguageInput";
import GroupBox from "../../../../standalone/GroupBox";
import { Grid } from "@material-ui/core";

export const MultiLanguageInputStory = (): React.ReactElement => {
	const [values, setValues] = useState<
		Partial<Record<MultiLanguageInputSupportedLanguages, string>>
	>({});

	const enabledLangs: MultiLanguageInputSupportedLanguages[] = [
		"en",
		"de",
		"fr",
	];

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<GroupBox label={"no label, enabled"}>
					<MultiLanguageInput
						enabledLanguages={enabledLangs}
						values={values}
						onChange={setValues}
					/>
				</GroupBox>
			</Grid>
			<Grid item xs={6}>
				<GroupBox label={"label, enabled"}>
					<MultiLanguageInput
						enabledLanguages={enabledLangs}
						values={values}
						onChange={setValues}
						label={"Example Label"}
					/>
				</GroupBox>
			</Grid>
			<Grid item xs={6}>
				<GroupBox label={"label, disabled"}>
					<MultiLanguageInput
						enabledLanguages={enabledLangs}
						values={values}
						onChange={setValues}
						label={"Example Label"}
						disabled
					/>
				</GroupBox>
			</Grid>
			<Grid item xs={12}>
				<GroupBox label={"no label, disabled"}>
					<MultiLanguageInput
						enabledLanguages={enabledLangs}
						values={values}
						onChange={setValues}
						disabled
					/>
				</GroupBox>
			</Grid>
			<Grid item xs={6}>
				<GroupBox label={"label, enabled, multiline"}>
					<MultiLanguageInput
						enabledLanguages={enabledLangs}
						values={values}
						onChange={setValues}
						label={"Example Label"}
						multiline
					/>
				</GroupBox>
			</Grid>
		</Grid>
	);
};

MultiLanguageInputStory.storyName = "MultiLanguageInput";
