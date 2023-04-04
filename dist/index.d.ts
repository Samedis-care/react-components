import { MultiSelectWithCheckBoxTheme, SelectorTheme, SelectorThemeExpert } from "./standalone";
import { DataGridTheme, DataGridThemeExpert } from "./standalone/DataGrid/DataGrid";
import { MenuTheme } from "./standalone/Portal/Menu";
import { MenuItemTheme } from "./standalone/Portal/MenuItem/Material";
import { ActionButtonTheme } from "./standalone/UIKit/ActionButton";
import { CheckboxTheme } from "./standalone/UIKit/Checkbox";
import { InputTheme } from "./standalone/UIKit/CommonStyles";
import { ComponentWithLabelTheme } from "./standalone/UIKit/ComponentWithLabel";
import { FormButtonTheme } from "./standalone/UIKit/FormButtons";
import { SubActionButtonTheme } from "./standalone/UIKit/SubActionButton";
import { ImageBoxTheme } from "./standalone/FileUpload/MultiImage/ImageBox";
import { ImageDialogEntryTheme } from "./standalone/FileUpload/MultiImage/ImageDialogEntry";
import { MultiImageTheme } from "./standalone/FileUpload/MultiImage/MultiImage";
import { FormPageLayoutTheme } from "./standalone/Form/FormPageLayout";
import { FileUploadProps } from "./standalone/FileUpload/Generic";
import { ImageSelectorProps } from "./standalone/FileUpload/Image/ImageSelector";
import { ImageDotsTheme } from "./standalone/FileUpload/MultiImage/ImageDots";
export * from "./standalone";
export * from "./framework";
export * from "./non-standalone";
export * from "./backend-integration";
export * from "./backend-components";
export { default as ComponentsCareI18n } from "./i18n";
export * from "./utils";
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
declare module "@material-ui/core/styles/createMuiTheme" {
    interface Theme {
        componentsCare?: ComponentsCareTheme;
    }
    interface ThemeOptions {
        componentsCare?: ComponentsCareTheme;
    }
}
