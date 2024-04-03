import {
	DataGridTheme,
	DataGridThemeExpert,
} from "./standalone/DataGrid/DataGrid";
import { MenuTheme } from "./standalone/Portal/Menu";
import { MenuItemTheme } from "./standalone/Portal/MenuItem/Material";
import { FileUploadProps } from "./standalone/FileUpload/Generic";
import { ImageSelectorProps } from "./standalone/FileUpload/Image/ImageSelector";
import { MultiImageTheme } from "./standalone/FileUpload/MultiImage/MultiImage";
import {
	BaseSelectorClassKey,
	BaseSelectorData,
	BaseSelectorProps,
	HowToBoxClassKey,
	HowToBoxProps,
	MultiSelectClassKey,
	MultiSelectorData,
	MultiSelectProps,
} from "./standalone";
import { ComponentWithLabelTheme } from "./standalone/UIKit/ComponentWithLabel";
import { CheckboxTheme } from "./standalone/UIKit/Checkbox";
import { InputTheme } from "./standalone/UIKit/CommonStyles";
import {
	ActionButtonClassKey,
	ActionButtonProps,
} from "./standalone/UIKit/ActionButton";
import {
	SubActionButtonClassKey,
	SubActionButtonProps,
} from "./standalone/UIKit/SubActionButton";
import {
	FormButtonsClassKey,
	FormButtonsProps,
} from "./standalone/UIKit/FormButtons";
import {
	FormPageLayoutClassKey,
	FormPageLayoutProps,
} from "./standalone/Form/FormPageLayout";
import { GroupBoxClassKey, GroupBoxProps } from "./standalone/GroupBox";
import {
	SignalPortletClassKey,
	SignalPortletProps,
} from "./standalone/SignalPortlet";
import {
	ComponentsOverrides,
	ComponentsVariants,
	Theme as MuiTheme,
} from "@mui/material";
import { LoaderClassKey, LoaderProps } from "./standalone/Loader";
import {
	FormLoaderOverlayClassKey,
	FormLoaderOverlayProps,
} from "./standalone/Form/FormLoaderOverlay";
import {
	MultiGridClassKey,
	MultiGridProps,
} from "./standalone/Virtualized/MultiGrid";
import {
	VerticalDividerClassKey,
	VerticalDividerProps,
} from "./standalone/VerticalDivider";
import {
	MultiLanguageInputClassKey,
	MultiLanguageInputProps,
} from "./standalone/UIKit/InputControls/MultiLanguageInput";
import {
	DefaultFormPageButtonsClassKey,
	DefaultFormPageButtonsProps,
} from "./backend-components/Form/DefaultFormPageButtons";
import { InfoBoxClassKey, InfoBoxProps } from "./standalone/InfoBox";
import {
	SignalPortletItemClassKey,
	SignalPortletItemProps,
} from "./standalone/SignalPortlet/SignalPortletItem";
import {
	InlineSwitchClassKey,
	InlineSwitchProps,
} from "./standalone/InlineSwitch";
import {
	MultiSelectEntryClassKey,
	MultiSelectEntryProps,
} from "./standalone/Selector/MultiSelectEntry";
import {
	ImageDotsClassKey,
	ImageDotsProps,
} from "./standalone/FileUpload/MultiImage/ImageDots";
import {
	ImageBoxClassKey,
	ImageBoxProps,
} from "./standalone/FileUpload/MultiImage/ImageBox";
import {
	ImageDialogEntryClassKey,
	ImageDialogEntryProps,
} from "./standalone/FileUpload/MultiImage/ImageDialogEntry";
import {
	CollapsibleMenuClassKey,
	CollapsibleMenuProps,
} from "./standalone/Portal/CollapsibleMenu";

export interface ComponentsCareTheme {
	dataGrid?: DataGridTheme;
	dataGridExpert?: DataGridThemeExpert;
	portal?: {
		menu?: MenuTheme;
		menuItem?: MenuItemTheme;
	};
	fileUpload?: {
		generic?: {
			defaultVariant?: FileUploadProps["variant"];
		};
		image?: {
			defaultVariant?: ImageSelectorProps["variant"];
		};
		multiImage?: {
			root?: MultiImageTheme;
		};
	};
	uiKit?: {
		label?: ComponentWithLabelTheme;
		checkbox?: CheckboxTheme;
		input?: InputTheme;
		hideDisabledIcons?: boolean;
	};
}

declare module "@mui/material/styles/createTheme" {
	interface Theme {
		componentsCare?: ComponentsCareTheme;
	}

	interface ThemeOptions {
		componentsCare?: ComponentsCareTheme;
	}
}

// start new styles

type Theme = Omit<MuiTheme, "components">;

declare module "@mui/material/styles" {
	interface ComponentNameToClassKey {
		CcSignalPortlet: SignalPortletClassKey;
		CcSignalPortletItem: SignalPortletItemClassKey;
		CcActionButton: ActionButtonClassKey;
		CcFormLoaderOverlay: FormLoaderOverlayClassKey;
		CcLoader: LoaderClassKey;
		CcMultiGrid: MultiGridClassKey;
		CcVerticalDivider: VerticalDividerClassKey;
		CcMultiLanguageInput: MultiLanguageInputClassKey;
		CcFormButtons: FormButtonsClassKey;
		CcDefaultFormPageButtons: DefaultFormPageButtonsClassKey;
		CcSubActionButton: SubActionButtonClassKey;
		CcGroupBox: GroupBoxClassKey;
		CcHowToBox: HowToBoxClassKey;
		CcInfoBox: InfoBoxClassKey;
		CcFormPageLayout: FormPageLayoutClassKey;
		CcInlineSwitch: InlineSwitchClassKey;
		CcBaseSelector: BaseSelectorClassKey;
		CcMultiSelectEntry: MultiSelectEntryClassKey;
		CcMultiSelect: MultiSelectClassKey;
		CcImageDots: ImageDotsClassKey;
		CcImageBox: ImageBoxClassKey;
		CcImageDialogEntry: ImageDialogEntryClassKey;
		CcCollapsibleMenu: CollapsibleMenuClassKey;
	}

	interface ComponentsPropsList {
		CcSignalPortlet: Partial<SignalPortletProps>;
		CcSignalPortletItem: Partial<SignalPortletItemProps>;
		CcActionButton: Partial<ActionButtonProps>;
		CcFormLoaderOverlay: Partial<FormLoaderOverlayProps>;
		CcLoader: Partial<LoaderProps>;
		CcMultiGrid: Partial<MultiGridProps>;
		CcVerticalDivider: Partial<VerticalDividerProps>;
		CcMultiLanguageInput: Partial<MultiLanguageInputProps>;
		CcFormButtons: Partial<FormButtonsProps>;
		CcDefaultFormPageButtons: Partial<DefaultFormPageButtonsProps>;
		CcSubActionButton: Partial<SubActionButtonProps>;
		CcGroupBox: Partial<GroupBoxProps>;
		CcHowToBox: Partial<HowToBoxProps>;
		CcInfoBox: Partial<InfoBoxProps>;
		CcFormPageLayout: Partial<FormPageLayoutProps>;
		CcInlineSwitch: Partial<InlineSwitchProps>;
		CcBaseSelector: Partial<BaseSelectorProps<BaseSelectorData, never>>;
		CcMultiSelectEntry: Partial<MultiSelectEntryProps<MultiSelectorData>>;
		CcMultiSelect: Partial<MultiSelectProps<MultiSelectorData>>;
		CcImageDots: Partial<ImageDotsProps>;
		CcImageBox: Partial<ImageBoxProps>;
		CcImageDialogEntry: Partial<ImageDialogEntryProps>;
		CcCollapsibleMenu: Partial<CollapsibleMenuProps>;
	}

	interface Components {
		CcSignalPortlet?: {
			defaultProps?: ComponentsPropsList["CcSignalPortlet"];
			styleOverrides?: ComponentsOverrides<Theme>["CcSignalPortlet"];
			variants?: ComponentsVariants["CcSignalPortlet"];
		};
		CcSignalPortletItem?: {
			defaultProps?: ComponentsPropsList["CcSignalPortletItem"];
			styleOverrides?: ComponentsOverrides<Theme>["CcSignalPortletItem"];
			variants?: ComponentsVariants["CcSignalPortletItem"];
		};
		CcActionButton?: {
			defaultProps?: ComponentsPropsList["CcActionButton"];
			styleOverrides?: ComponentsOverrides<Theme>["CcActionButton"];
			variants?: ComponentsVariants["CcActionButton"];
		};
		CcFormLoaderOverlay?: {
			defaultProps?: ComponentsPropsList["CcFormLoaderOverlay"];
			styleOverrides?: ComponentsOverrides<Theme>["CcFormLoaderOverlay"];
			variants?: ComponentsVariants["CcFormLoaderOverlay"];
		};
		CcLoader?: {
			defaultProps?: ComponentsPropsList["CcLoader"];
			styleOverrides?: ComponentsOverrides<Theme>["CcLoader"];
			variants?: ComponentsVariants["CcLoader"];
		};
		CcMultiGrid?: {
			defaultProps?: ComponentsPropsList["CcMultiGrid"];
			styleOverrides?: ComponentsOverrides<Theme>["CcMultiGrid"];
			variants?: ComponentsVariants["CcMultiGrid"];
		};
		CcVerticalDivider?: {
			defaultProps?: ComponentsPropsList["CcVerticalDivider"];
			styleOverrides?: ComponentsOverrides<Theme>["CcVerticalDivider"];
			variants?: ComponentsVariants["CcVerticalDivider"];
		};
		CcMultiLanguageInput?: {
			defaultProps?: ComponentsPropsList["CcMultiLanguageInput"];
			styleOverrides?: ComponentsOverrides<Theme>["CcMultiLanguageInput"];
			variants?: ComponentsVariants["CcMultiLanguageInput"];
		};
		CcFormButtons?: {
			defaultProps?: ComponentsPropsList["CcFormButtons"];
			styleOverrides?: ComponentsOverrides<Theme>["CcFormButtons"];
			variants?: ComponentsVariants["CcFormButtons"];
		};
		CcDefaultFormPageButtons?: {
			defaultProps?: ComponentsPropsList["CcDefaultFormPageButtons"];
			styleOverrides?: ComponentsOverrides<Theme>["CcDefaultFormPageButtons"];
			variants?: ComponentsVariants["CcDefaultFormPageButtons"];
		};
		CcSubActionButton?: {
			defaultProps?: ComponentsPropsList["CcSubActionButton"];
			styleOverrides?: ComponentsOverrides<Theme>["CcSubActionButton"];
			variants?: ComponentsVariants["CcSubActionButton"];
		};
		CcGroupBox?: {
			defaultProps?: ComponentsPropsList["CcGroupBox"];
			styleOverrides?: ComponentsOverrides<Theme>["CcGroupBox"];
			variants?: ComponentsVariants["CcGroupBox"];
		};
		CcHowToBox?: {
			defaultProps?: ComponentsPropsList["CcHowToBox"];
			styleOverrides?: ComponentsOverrides<Theme>["CcHowToBox"];
			variants?: ComponentsVariants["CcHowToBox"];
		};
		CcInfoBox?: {
			defaultProps?: ComponentsPropsList["CcInfoBox"];
			styleOverrides?: ComponentsOverrides<Theme>["CcInfoBox"];
			variants?: ComponentsVariants["CcInfoBox"];
		};
		CcFormPageLayout?: {
			defaultProps?: ComponentsPropsList["CcFormPageLayout"];
			styleOverrides?: ComponentsOverrides<Theme>["CcFormPageLayout"];
			variants?: ComponentsVariants["CcFormPageLayout"];
		};
		CcInlineSwitch?: {
			defaultProps?: ComponentsPropsList["CcInlineSwitch"];
			styleOverrides?: ComponentsOverrides<Theme>["CcInlineSwitch"];
			variants?: ComponentsVariants["CcInlineSwitch"];
		};
		CcBaseSelector?: {
			defaultProps?: ComponentsPropsList["CcBaseSelector"];
			styleOverrides?: ComponentsOverrides<Theme>["CcBaseSelector"];
			variants?: ComponentsVariants["CcBaseSelector"];
		};
		CcMultiSelectEntry?: {
			defaultProps?: ComponentsPropsList["CcMultiSelectEntry"];
			styleOverrides?: ComponentsOverrides<Theme>["CcMultiSelectEntry"];
			variants?: ComponentsVariants["CcMultiSelectEntry"];
		};
		CcMultiSelect?: {
			defaultProps?: ComponentsPropsList["CcMultiSelect"];
			styleOverrides?: ComponentsOverrides<Theme>["CcMultiSelect"];
			variants?: ComponentsVariants["CcMultiSelect"];
		};
		CcImageDots?: {
			defaultProps?: ComponentsPropsList["CcImageDots"];
			styleOverrides?: ComponentsOverrides<Theme>["CcImageDots"];
			variants?: ComponentsVariants["CcImageDots"];
		};
		CcImageBox?: {
			defaultProps?: ComponentsPropsList["CcImageBox"];
			styleOverrides?: ComponentsOverrides<Theme>["CcImageBox"];
			variants?: ComponentsVariants["CcImageBox"];
		};
		CcImageDialogEntry?: {
			defaultProps?: ComponentsPropsList["CcImageDialogEntry"];
			styleOverrides?: ComponentsOverrides<Theme>["CcImageDialogEntry"];
			variants?: ComponentsVariants["CcImageDialogEntry"];
		};
		CcCollapsibleMenu?: {
			defaultProps?: ComponentsPropsList["CcCollapsibleMenu"];
			styleOverrides?: ComponentsOverrides<Theme>["CcCollapsibleMenu"];
			variants?: ComponentsVariants["CcCollapsibleMenu"];
		};
	}
}
