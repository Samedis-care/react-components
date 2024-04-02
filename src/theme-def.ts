import {
	DataGridTheme,
	DataGridThemeExpert,
} from "./standalone/DataGrid/DataGrid";
import { MenuTheme } from "./standalone/Portal/Menu";
import { MenuItemTheme } from "./standalone/Portal/MenuItem/Material";
import { FileUploadProps } from "./standalone/FileUpload/Generic";
import { ImageSelectorProps } from "./standalone/FileUpload/Image/ImageSelector";
import { MultiImageTheme } from "./standalone/FileUpload/MultiImage/MultiImage";
import { ImageBoxTheme } from "./standalone/FileUpload/MultiImage/ImageBox";
import { ImageDialogEntryTheme } from "./standalone/FileUpload/MultiImage/ImageDialogEntry";
import { ImageDotsTheme } from "./standalone/FileUpload/MultiImage/ImageDots";
import {
	HowToBoxClassKey,
	HowToBoxProps,
	MultiSelectTheme,
	SelectorTheme,
	SelectorThemeExpert,
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
			imageBox?: ImageBoxTheme;
			imageDialogEntry?: ImageDialogEntryTheme;
			dots?: ImageDotsTheme;
		};
	};
	selector?: SelectorTheme;
	multiSelect?: MultiSelectTheme;
	uiKit?: {
		label?: ComponentWithLabelTheme;
		checkbox?: CheckboxTheme;
		input?: InputTheme;
		baseSelectorExpert?: SelectorThemeExpert;
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
	}

	interface ComponentsPropsList {
		CcSignalPortlet: SignalPortletProps;
		CcSignalPortletItem: SignalPortletItemProps;
		CcActionButton: ActionButtonProps;
		CcFormLoaderOverlay: FormLoaderOverlayProps;
		CcLoader: LoaderProps;
		CcMultiGrid: MultiGridProps;
		CcVerticalDivider: VerticalDividerProps;
		CcMultiLanguageInput: MultiLanguageInputProps;
		CcFormButtons: FormButtonsProps;
		CcDefaultFormPageButtons: DefaultFormPageButtonsProps;
		CcSubActionButton: SubActionButtonProps;
		CcGroupBox: GroupBoxProps;
		CcHowToBox: HowToBoxProps;
		CcInfoBox: InfoBoxProps;
		CcFormPageLayout: FormPageLayoutProps;
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
	}
}
