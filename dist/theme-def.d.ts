import { DataGridTheme, DataGridThemeExpert } from "./standalone/DataGrid/DataGrid";
import { MenuTheme } from "./standalone/Portal/Menu";
import { MenuItemTheme } from "./standalone/Portal/MenuItem/Material";
import { FileUploadProps } from "./standalone/FileUpload/Generic";
import { ImageSelectorProps } from "./standalone/FileUpload/Image/ImageSelector";
import { MultiImageTheme } from "./standalone/FileUpload/MultiImage/MultiImage";
import { ImageBoxTheme } from "./standalone/FileUpload/MultiImage/ImageBox";
import { ImageDialogEntryTheme } from "./standalone/FileUpload/MultiImage/ImageDialogEntry";
import { ImageDotsTheme } from "./standalone/FileUpload/MultiImage/ImageDots";
import { MultiSelectTheme, MultiSelectWithCheckBoxTheme, SelectorTheme, SelectorThemeExpert } from "./standalone";
import { ComponentWithLabelTheme } from "./standalone/UIKit/ComponentWithLabel";
import { CheckboxTheme } from "./standalone/UIKit/Checkbox";
import { InputTheme } from "./standalone/UIKit/CommonStyles";
import { ActionButtonTheme } from "./standalone/UIKit/ActionButton";
import { SubActionButtonTheme } from "./standalone/UIKit/SubActionButton";
import { FormButtonTheme } from "./standalone/UIKit/FormButtons";
import { FormPageLayoutTheme } from "./standalone/Form/FormPageLayout";
import { GroupBoxTheme } from "./standalone/GroupBox";
import { SignalPortletItemTheme } from "./standalone/SignalPortlet/SignalPortletItem";
import { SignalPortletClassKey, SignalPortletProps } from "./standalone/SignalPortlet";
import { ComponentsOverrides, ComponentsVariants, Theme as MuiTheme } from "@mui/material";
export interface ComponentsCareTheme {
    dataGrid?: DataGridTheme;
    dataGridExpert?: DataGridThemeExpert;
    groupBox?: GroupBoxTheme;
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
    signalPortlet?: {
        item?: SignalPortletItemTheme;
    };
    selector?: SelectorTheme;
    multiSelect?: MultiSelectTheme;
    selectorWithCheckbox?: MultiSelectWithCheckBoxTheme;
    uiKit?: {
        label?: ComponentWithLabelTheme;
        checkbox?: CheckboxTheme;
        input?: InputTheme;
        actionButton?: ActionButtonTheme;
        subActionButton?: SubActionButtonTheme;
        formButtons?: FormButtonTheme;
        baseSelectorExpert?: SelectorThemeExpert;
        formPage?: {
            layout?: FormPageLayoutTheme;
        };
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
type Theme = Omit<MuiTheme, "components">;
declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        CcSignalPortlet: SignalPortletClassKey;
    }
    interface ComponentsPropsList {
        CcSignalPortlet: SignalPortletProps;
    }
    interface Components {
        CcSignalPortlet?: {
            defaultProps?: ComponentsPropsList["CcSignalPortlet"];
            styleOverrides?: ComponentsOverrides<Theme>["CcSignalPortlet"];
            variants?: ComponentsVariants["CcSignalPortlet"];
        };
    }
}
export {};
