import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { fn, expect } from "storybook/test";
import {
	Save as SaveIcon,
	Delete as DeleteIcon,
	Cancel as CancelIcon,
	Home as HomeIcon,
} from "@mui/icons-material";
import ActionButton from "./ActionButton";
import SubActionButton from "./SubActionButton";
import FormButtons from "./FormButtons";
import IconButtonWithText from "./IconButtonWithText";
import TextFieldWithHelp from "./TextFieldWithHelp";
import NumberFormatter from "./NumberFormatter";
import CenteredTypography from "./CenteredTypography";
import Checkbox from "./Checkbox";
import { TextFieldCC } from "./MuiWarning";
import { Button } from "@mui/material";

// ---- ActionButton ----

const ActionButtonMeta: Meta<typeof ActionButton> = {
	title: "Standalone/UIKit/ActionButton",
	component: ActionButton,
	parameters: { layout: "centered" },
	args: {
		children: "Save",
		onClick: fn(),
	},
};
export default ActionButtonMeta;

type ActionButtonStory = StoryObj<typeof ActionButton>;

export const Default: ActionButtonStory = {
	args: {
		children: "Save",
		icon: <SaveIcon />,
	},
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole("button", { name: "Save" });
		await userEvent.click(button);
		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

export const ClickDisabled: ActionButtonStory = {
	name: "Disabled",
	args: {
		children: "Save",
		icon: <SaveIcon />,
		disabled: true,
	},
};

export const Small: ActionButtonStory = {
	args: {
		children: "Save",
		icon: <SaveIcon />,
		small: true,
	},
};

export const SmallDisabled: ActionButtonStory = {
	args: {
		children: "Save",
		icon: <SaveIcon />,
		small: true,
		disabled: true,
	},
};

export const NoIcon: ActionButtonStory = {
	args: {
		children: "Continue",
	},
};

export const SubActionButtonDefault: ActionButtonStory = {
	render: () => (
		<SubActionButton icon={<HomeIcon />} onClick={() => {}}>
			Go Home
		</SubActionButton>
	),
};

export const SubActionButtonSmall: ActionButtonStory = {
	render: () => (
		<SubActionButton icon={<HomeIcon />} small onClick={() => {}}>
			Go Home
		</SubActionButton>
	),
};

export const SubActionButtonDisabled: ActionButtonStory = {
	render: () => (
		<SubActionButton icon={<DeleteIcon />} disabled onClick={() => {}}>
			Delete
		</SubActionButton>
	),
};

export const FormButtonsSaveCancelDelete: ActionButtonStory = {
	render: () => (
		<FormButtons>
			<Button variant="contained" startIcon={<SaveIcon />} onClick={() => {}}>
				Save
			</Button>
			<Button variant="outlined" startIcon={<CancelIcon />} onClick={() => {}}>
				Cancel
			</Button>
			<Button
				variant="outlined"
				color="error"
				startIcon={<DeleteIcon />}
				onClick={() => {}}
			>
				Delete
			</Button>
		</FormButtons>
	),
};

export const FormButtonsSaveCancel: ActionButtonStory = {
	render: () => (
		<FormButtons>
			<Button variant="contained" startIcon={<SaveIcon />} onClick={() => {}}>
				Save
			</Button>
			<Button variant="outlined" startIcon={<CancelIcon />} onClick={() => {}}>
				Cancel
			</Button>
		</FormButtons>
	),
};

export const FormButtonsEmpty: ActionButtonStory = {
	render: () => (
		<FormButtons>
			{null}
			{false}
		</FormButtons>
	),
};

export const IconButtonWithTextStory: ActionButtonStory = {
	render: () => (
		<IconButtonWithText icon={<HomeIcon />} text="Home" onClick={() => {}} />
	),
};

export const TextFieldWithHelpBasic: ActionButtonStory = {
	render: () => <TextFieldWithHelp label="Name" placeholder="Enter name" />,
};

export const TextFieldWithHelpWithInfo: ActionButtonStory = {
	render: () => (
		<TextFieldWithHelp
			label="Email"
			placeholder="user@example.com"
			openInfo={() => alert("This is the email field")}
		/>
	),
};

export const TextFieldWithHelpError: ActionButtonStory = {
	render: () => (
		<TextFieldWithHelp
			label="Username"
			value="bad value"
			error
			helperText="Username already taken"
		/>
	),
};

export const TextFieldWithHelpDisabled: ActionButtonStory = {
	render: () => (
		<TextFieldWithHelp label="Read Only" value="fixed value" disabled />
	),
};

export const NumberFormatterBasic: ActionButtonStory = {
	render: () => <NumberFormatter value={1234567.89} />,
};

export const NumberFormatterNull: ActionButtonStory = {
	render: () => <NumberFormatter value={null} />,
};

export const NumberFormatterCurrency: ActionButtonStory = {
	render: () => (
		<NumberFormatter
			value={9999.5}
			options={{ style: "currency", currency: "USD" }}
		/>
	),
};

export const NumberFormatterPercent: ActionButtonStory = {
	render: () => <NumberFormatter value={0.75} options={{ style: "percent" }} />,
};

export const CenteredTypographyStory: ActionButtonStory = {
	render: () => (
		<div style={{ width: 400, height: 200, border: "1px dashed #ccc" }}>
			<CenteredTypography variant="h5">Centered Text</CenteredTypography>
		</div>
	),
};

export const CheckboxUnchecked: ActionButtonStory = {
	render: () => <Checkbox />,
};

export const CheckboxChecked: ActionButtonStory = {
	render: () => <Checkbox checked />,
};

export const CheckboxDisabled: ActionButtonStory = {
	render: () => <Checkbox disabled />,
};

export const CheckboxCheckedDisabled: ActionButtonStory = {
	render: () => <Checkbox checked disabled />,
};

export const CheckboxControlled: ActionButtonStory = {
	render: () => {
		const [checked, setChecked] = useState(false);
		return (
			<Checkbox
				checked={checked}
				onChange={(e) => setChecked(e.target.checked)}
			/>
		);
	},
};

export const MuiWarningNormal: ActionButtonStory = {
	render: () => <TextFieldCC label="Normal field" />,
};

export const MuiWarningActive: ActionButtonStory = {
	render: () => <TextFieldCC label="Warning field" warning />,
};

export const MuiWarningWithError: ActionButtonStory = {
	render: () => (
		<TextFieldCC
			label="Error overrides warning"
			warning
			error
			helperText="Error message"
		/>
	),
};
