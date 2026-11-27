import { MenuItemProps as PortalMenuItemProps, PortalMenuClassKey, PortalMenuProps } from "./standalone/Portal/Menu";
import { FileUploadClassKey, FileUploadProps } from "./standalone/FileUpload/Generic";
import { ImageSelectorClassKey, ImageSelectorProps } from "./standalone/FileUpload/Image/ImageSelector";
import { ImagePreviewDialogClassKey, ImagePreviewDialogProps } from "./standalone/FileUpload/Image/ImagePreviewDialog";
import { MultiImageClassKey, MultiImageProps } from "./standalone/FileUpload/MultiImage/MultiImage";
import { BaseSelectorClassKey, BaseSelectorData, BaseSelectorIconOwnerState, BaseSelectorThemeProps, HowToBoxClassKey, HowToBoxProps, MultiSelectClassKey, MultiSelectorData, MultiSelectProps, MultiSelectSelectorOwnerState, MultiSelectWithoutGroupClassKey, MultiSelectWithoutGroupProps, MultiSelectWithTagsClassKey, MultiSelectWithTagsProps, PopupMenuClassKey, PopupMenuProps, PortalLayoutClassKey, PortalLayoutContainerOwnerState, PortalLayoutProps } from "./standalone";
import { SmallIconButtonClassKey, SmallIconButtonProps, SmallestIconButtonClassKey, SmallestIconButtonProps, SmallListItemClassKey, SmallListItemProps, SmallListItemButtonClassKey, SmallListItemButtonProps, SelectorSmallListItemClassKey, SelectorSmallListItemProps, SelectorSmallListItemButtonClassKey, SelectorSmallListItemButtonProps, SmallListItemIconClassKey, SmallListItemIconProps } from "./standalone/Small";
import { ComponentWithLabelClassKey, ComponentWithLabelProps } from "./standalone/UIKit/ComponentWithLabel";
import { CheckboxClassKey } from "./standalone/UIKit/Checkbox";
import { ActionButtonClassKey, ActionButtonOwnerState, ActionButtonProps } from "./standalone/UIKit/ActionButton";
import { SubActionButtonClassKey, SubActionButtonOwnerState, SubActionButtonProps } from "./standalone/UIKit/SubActionButton";
import { FormButtonsClassKey, FormButtonsProps } from "./standalone/UIKit/FormButtons";
import { FormPageLayoutClassKey, FormPageLayoutProps } from "./standalone/Form/FormPageLayout";
import { GroupBoxClassKey, GroupBoxProps } from "./standalone/GroupBox";
import { MatrixCellTileClassKey, MatrixCellTileProps, MatrixGridClassKey, MatrixGridProps } from "./standalone/Matrix";
import { SignalPortletClassKey, SignalPortletProps } from "./standalone/SignalPortlet";
import { CheckboxProps, Interpolation, Theme as MuiTheme } from "@mui/material";
import { LoaderClassKey, LoaderProps } from "./standalone/Loader";
import { FormLoaderOverlayClassKey, FormLoaderOverlayProps } from "./standalone/Form/FormLoaderOverlay";
import { MultiGridClassKey, MultiGridProps } from "./standalone/Virtualized/MultiGrid";
import { VerticalDividerClassKey, VerticalDividerProps } from "./standalone/VerticalDivider";
import { CountryFlagClassKey, CountryFlagProps } from "./standalone/CountryFlag";
import { MultiLanguageInputClassKey, MultiLanguageInputLanguageLabelOwnerState, MultiLanguageInputProps } from "./standalone/UIKit/InputControls/MultiLanguageInput";
import { DefaultFormPageButtonsClassKey, DefaultFormPageButtonsProps } from "./backend-components/Form/DefaultFormPageButtons";
import type { FilesGridClassKey } from "./backend-integration/Model/Types/Renderers/FilesGrid/FilesGrid";
import { InfoBoxClassKey, InfoBoxProps } from "./standalone/InfoBox";
import { SignalPortletItemClassKey, SignalPortletItemProps } from "./standalone/SignalPortlet/SignalPortletItem";
import { InlineSwitchClassKey, InlineSwitchThemeProps } from "./standalone/InlineSwitch";
import { MultiSelectEntryClassKey, MultiSelectEntryImageOwnerState, MultiSelectEntryProps, MultiSelectEntrySelectedOwnerState } from "./standalone/Selector/MultiSelectEntry";
import { ImageDotsClassKey, ImageDotsProps } from "./standalone/FileUpload/MultiImage/ImageDots";
import { ImageBoxClassKey, ImageBoxProps, ImageBoxRootOwnerState, ImageBoxStyledImageOwnerState } from "./standalone/FileUpload/MultiImage/ImageBox";
import { ImageDialogEntryClassKey, ImageDialogEntryProps } from "./standalone/FileUpload/MultiImage/ImageDialogEntry";
import { CollapsibleMenuClassKey, CollapsibleMenuProps } from "./standalone/Portal/CollapsibleMenu";
import { CenteredTypographyClassKey, CenteredTypographyProps } from "./standalone/UIKit/CenteredTypography";
import { PortalLayoutMenuClassKey, PortalLayoutMenuProps } from "./standalone/Portal/Layout/Menu";
import { SignPadDialogClassKey, SignPadDialogProps } from "./non-standalone/Dialog/SignPadDialog";
import { DialogTitleClassKey, DialogTitleProps } from "./non-standalone/Dialog/DialogTitle";
import { MenuItemJumboReactLightClassKey, MenuItemJumboReactLightProps } from "./standalone/Portal/MenuItem/JumboReact/Light";
import { MenuItemJumboReactDarkClassKey, MenuItemJumboReactDarkProps } from "./standalone/Portal/MenuItem/JumboReact/Dark";
import { FileClassKey, FileProps } from "./standalone/FileUpload/Generic/File";
import { MenuItemMaterialClassKey, MenuItemMaterialProps } from "./standalone/Portal/MenuItem/Material";
import { LocalizedKeyboardDatePickerClassKey, LocalizedKeyboardDatePickerProps } from "./standalone/LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import { UiKitInputClassKey, UiKitInputOutlinedClassKey, UiKitInputOutlinedProps, UiKitInputProps, UiKitTextFieldClassKey, UiKitTextFieldProps } from "./standalone/UIKit/CommonStyles";
import { LocaleSelectorDialogClassKey, LocaleSelectorDialogProps } from "./non-standalone/LocaleSelector/LocaleSelectorDialog";
import { LocaleSelectorDialogContentClassKey, LocaleSelectorDialogContentProps } from "./non-standalone/LocaleSelector/LocaleSelectorDialogContent";
import { LocaleSelectorEntryClassKey, LocaleSelectorEntryProps } from "./non-standalone/LocaleSelector/LocaleSelectorEntry";
import { SignPadClassKey, SignPadProps } from "./standalone/SignPad";
import { FormDialogClassKey, FormDialogProps } from "./backend-components/Form/FormDialog";
import { PageTitleClassKey, PageTitleProps } from "./non-standalone/PageTitle/PageTitle";
import { InfiniteScrollClassKey, InfiniteScrollProps } from "./standalone/InfiniteScroll";
import { NotificationsClassKey, NotificationsProps } from "./standalone/Notifications";
import { ToastClassKey, ToastProps } from "./standalone/Toast";
import { DayContentsButtonOwnerState, DayContentsClassKey, DayContentsProps } from "./standalone/Schedule/Common/DayContents";
import { WeekViewDayClassKey, WeekViewDayProps } from "./standalone/Schedule/Weekly/WeekViewDay";
import { ScrollableScheduleClassKey, ScrollableScheduleProps } from "./standalone/Schedule/Scrollable";
import { WeekViewClassKey, WeekViewProps } from "./standalone/Schedule/Weekly";
import { DataGridClassKey, DataGridProps } from "./standalone/DataGrid/DataGrid";
import { GridMultiSelectFilterClassKey, GridMultiSelectFilterProps } from "./standalone/DataGrid/GridMultiSelectFilter";
import { GridSingleSelectFilterClassKey, GridSingleSelectFilterProps } from "./standalone/DataGrid/GridSingleSelectFilter";
import { ScrollableScheduleDayClassKey, ScrollableScheduleDayProps } from "./standalone/Schedule/Scrollable/ScrollableScheduleDay";
import { FormClassKey } from "./backend-components";
import { BasicFormPageProps } from "./backend-components/Form/BasicFormPage";
import { FlowEngineClassKey, FlowEngineThemeProps } from "./backend-components/Form/FlowEngine/FlowEngine";
import { DirtyMarkerClassKey, FieldStateClassKey } from "./standalone/UIKit/MuiFieldState";
import { CrudClassKey } from "./backend-components/CRUD";
import { FormTabClassKey } from "./backend-components/Form/FormTab";
import { FormAutoSaveClassKey, FormAutoSaveProps } from "./backend-components/Form/FormAutoSave";
import { RoutedTabsClassKey, RoutedTabsProps } from "./non-standalone/RoutedTabs/RoutedTabs";
import { RoutedTabPanelWrapperClassKey } from "./non-standalone/RoutedTabs/RoutedTabPanelWrapper";
import { CrudLoadStatusClassKey, CrudLoadStatusProps } from "./backend-components/FileUpload/CrudLoadStatus";
import { BackendSingleSelectThemeProps } from "./backend-components/Selector/BackendSingleSelect";
import { BackendMultiSelectThemeProps } from "./backend-components/Selector/BackendMultiSelect";
import { BackendMultipleSelectThemeProps } from "./backend-components/Selector/BackendMultipleSelect";
import { BackendMultiSelectWithTagsThemeProps } from "./backend-components/Selector/BackendMultiSelectWithTags";
import { BackendDataGridMultiSelectClassKey } from "./backend-components/Selector/BackendDataGridMultiSelect";
import { PartialExcept } from "./utils/distributiveOmit";
import { GridSingleSelectFilterBackendClassKey, GridSingleSelectFilterBackendProps } from "./standalone/DataGrid/GridSingleSelectFilterBackend";
import { ModelUnknown } from "./backend-integration";
import { GridMultiSelectFilterBackendClassKey, GridMultiSelectFilterBackendProps } from "./standalone/DataGrid/GridMultiSelectFilterBackend";
export interface ComponentsCareTheme {
}
declare module "@mui/material/styles" {
    interface Theme {
        componentsCare?: ComponentsCareTheme;
    }
    interface ThemeOptions {
        componentsCare?: ComponentsCareTheme;
    }
}
type Theme = Omit<MuiTheme, "components">;
/**
 * `styleOverrides` of a component that passes no `ownerState` to its slots.
 * MUI calls each function in it while styling every slot of the component,
 * with that slot's props, so a function can rely on the theme only.
 */
type StyleOverridesWithoutOwnerState<ClassKey extends string> = Partial<Record<ClassKey, Interpolation<{
    theme: Theme;
}>>>;
/**
 * `variants` of a component whose root gets `Props` directly and no
 * `ownerState`. MUI matches a variant's `props` against them and calls a
 * `props` function with them.
 */
type VariantsWithoutOwnerState<Props> = Array<{
    props: Partial<Props> | ((props: Partial<Props>) => boolean);
    style: Interpolation<{
        theme: Theme;
    }>;
}>;
/**
 * `styleOverrides` of a component that passes `OwnerState` to its slots as
 * their `ownerState`. MUI calls each function in it while styling every slot
 * of the component, with that slot's props.
 */
type StyleOverridesWithOwnerState<ClassKey extends string, OwnerState> = Partial<Record<ClassKey, Interpolation<{
    theme: Theme;
    ownerState: OwnerState;
}>>>;
/**
 * `styleOverrides` of a component that passes an `ownerState` to some of its
 * slots only. MUI calls each function in it while styling every slot of the
 * component, with that slot's props: `ownerState` holds the flags of the slot
 * being styled (`OwnerState` combines those of every slot that gets one), and
 * is undefined while a slot without one is styled.
 */
type StyleOverridesWithOptionalOwnerState<ClassKey extends string, OwnerState> = Partial<Record<ClassKey, Interpolation<{
    theme: Theme;
    ownerState?: Partial<OwnerState>;
}>>>;
/**
 * `variants` of a component whose root gets `Props` and `OwnerState` as its
 * `ownerState`. MUI matches each key of a variant's `props` against both,
 * and calls a `props` function with the props, the fields of `ownerState`
 * (which replace props of the same name) and `ownerState` itself.
 */
type VariantsWithOwnerState<Props, OwnerState> = Array<{
    props: {
        [Key in keyof Props | keyof OwnerState]?: (Key extends keyof Props ? Props[Key] : never) | (Key extends keyof OwnerState ? OwnerState[Key] : never);
    } | ((props: Partial<Omit<Props, keyof OwnerState>> & OwnerState & {
        ownerState: OwnerState;
    }) => boolean);
    style: Interpolation<{
        theme: Theme;
    }>;
}>;
declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        CcSignalPortlet: SignalPortletClassKey;
        CcSignalPortletItem: SignalPortletItemClassKey;
        CcActionButton: ActionButtonClassKey;
        CcFormLoaderOverlay: FormLoaderOverlayClassKey;
        CcLoader: LoaderClassKey;
        CcMultiGrid: MultiGridClassKey;
        CcVerticalDivider: VerticalDividerClassKey;
        CcSmallIconButton: SmallIconButtonClassKey;
        CcSmallestIconButton: SmallestIconButtonClassKey;
        CcSmallListItem: SmallListItemClassKey;
        CcSmallListItemButton: SmallListItemButtonClassKey;
        CcSelectorSmallListItem: SelectorSmallListItemClassKey;
        CcSelectorSmallListItemButton: SelectorSmallListItemButtonClassKey;
        CcSmallListItemIcon: SmallListItemIconClassKey;
        CcCountryFlag: CountryFlagClassKey;
        CcMultiLanguageInput: MultiLanguageInputClassKey;
        CcFormButtons: FormButtonsClassKey;
        CcDefaultFormPageButtons: DefaultFormPageButtonsClassKey;
        CcSubActionButton: SubActionButtonClassKey;
        CcGroupBox: GroupBoxClassKey;
        CcMatrixGrid: MatrixGridClassKey;
        CcMatrixCellTile: MatrixCellTileClassKey;
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
        CcCenteredTypography: CenteredTypographyClassKey;
        CcMultiImage: MultiImageClassKey;
        CcPortalLayoutMenu: PortalLayoutMenuClassKey;
        CcSignPadDialog: SignPadDialogClassKey;
        CcMenuItemJumboReactLight: MenuItemJumboReactLightClassKey;
        CcMenuItemJumboReactDark: MenuItemJumboReactDarkClassKey;
        CcFile: FileClassKey;
        CcDialogTitle: DialogTitleClassKey;
        CcFileUpload: FileUploadClassKey;
        CcCrudLoadStatus: CrudLoadStatusClassKey;
        CcImageSelector: ImageSelectorClassKey;
        CcImagePreviewDialog: ImagePreviewDialogClassKey;
        CcPortalMenu: PortalMenuClassKey;
        CcMenuItemMaterial: MenuItemMaterialClassKey;
        CcLocalizedKeyboardDatePicker: LocalizedKeyboardDatePickerClassKey;
        CcComponentWithLabel: ComponentWithLabelClassKey;
        CcCheckbox: CheckboxClassKey;
        CcUiKitInput: UiKitInputClassKey;
        CcUiKitInputOutlined: UiKitInputOutlinedClassKey;
        CcUiKitTextField: UiKitTextFieldClassKey;
        CcLocaleSelectorDialog: LocaleSelectorDialogClassKey;
        CcLocaleSelectorDialogContent: LocaleSelectorDialogContentClassKey;
        CcLocaleSelectorEntry: LocaleSelectorEntryClassKey;
        CcSignPad: SignPadClassKey;
        CcFormDialog: FormDialogClassKey;
        CcPageTitle: PageTitleClassKey;
        CcPopupMenu: PopupMenuClassKey;
        CcFilesGrid: FilesGridClassKey;
        CcPortalLayout: PortalLayoutClassKey;
        CcInfiniteScroll: InfiniteScrollClassKey;
        CcNotifications: NotificationsClassKey;
        CcToast: ToastClassKey;
        CcMultiSelectWithTags: MultiSelectWithTagsClassKey;
        CcMultiSelectWithoutGroup: MultiSelectWithoutGroupClassKey;
        CcDayContents: DayContentsClassKey;
        CcWeekViewDay: WeekViewDayClassKey;
        CcScrollableSchedule: ScrollableScheduleClassKey;
        CcScrollableScheduleDay: ScrollableScheduleDayClassKey;
        CcWeekView: WeekViewClassKey;
        CcDataGrid: DataGridClassKey;
        CcGridMultiSelectFilter: GridMultiSelectFilterClassKey;
        CcGridMultiSelectFilterBackend: GridMultiSelectFilterBackendClassKey;
        CcGridSingleSelectFilter: GridSingleSelectFilterClassKey;
        CcGridSingleSelectFilterBackend: GridSingleSelectFilterBackendClassKey;
        CcBackendDataGridMultiSelect: BackendDataGridMultiSelectClassKey;
        CcForm: FormClassKey;
        CcFlowEngine: FlowEngineClassKey;
        CcFieldState: FieldStateClassKey;
        CcDirtyMarker: DirtyMarkerClassKey;
        CcFormTab: FormTabClassKey;
        CcFormAutoSave: FormAutoSaveClassKey;
        CcCrud: CrudClassKey;
        CcRoutedTabs: RoutedTabsClassKey;
        CcRoutedTabPanelWrapper: RoutedTabPanelWrapperClassKey;
    }
    interface ComponentsPropsList {
        CcSignalPortlet: Partial<SignalPortletProps>;
        CcSignalPortletItem: Partial<SignalPortletItemProps>;
        CcActionButton: Partial<ActionButtonProps>;
        CcFormLoaderOverlay: Partial<FormLoaderOverlayProps>;
        CcLoader: Partial<LoaderProps>;
        CcMultiGrid: Partial<MultiGridProps>;
        CcVerticalDivider: Partial<VerticalDividerProps>;
        CcSmallIconButton: Partial<SmallIconButtonProps>;
        CcSmallestIconButton: Partial<SmallestIconButtonProps>;
        CcSmallListItem: Partial<SmallListItemProps>;
        CcSmallListItemButton: Partial<SmallListItemButtonProps>;
        CcSelectorSmallListItem: Partial<SelectorSmallListItemProps>;
        CcSelectorSmallListItemButton: Partial<SelectorSmallListItemButtonProps>;
        CcSmallListItemIcon: Partial<SmallListItemIconProps>;
        CcCountryFlag: Partial<CountryFlagProps>;
        CcMultiLanguageInput: Partial<MultiLanguageInputProps>;
        CcFormButtons: Partial<FormButtonsProps>;
        CcDefaultFormPageButtons: Partial<DefaultFormPageButtonsProps>;
        CcSubActionButton: Partial<SubActionButtonProps>;
        CcGroupBox: Partial<GroupBoxProps>;
        CcMatrixGrid: Partial<MatrixGridProps<unknown>>;
        CcMatrixCellTile: Partial<MatrixCellTileProps>;
        CcHowToBox: Partial<HowToBoxProps>;
        CcInfoBox: Partial<InfoBoxProps>;
        CcFormPageLayout: Partial<FormPageLayoutProps>;
        CcInlineSwitch: Partial<InlineSwitchThemeProps>;
        CcBaseSelector: PartialExcept<BaseSelectorThemeProps, "displaySwitch" | "switchLabel">;
        CcBackendSingleSelect: PartialExcept<BackendSingleSelectThemeProps, "switchFilterName" | "switchLabel">;
        CcBackendMultiSelect: PartialExcept<BackendMultiSelectThemeProps, "switchFilterName" | "switchLabel">;
        CcBackendMultipleSelect: PartialExcept<BackendMultipleSelectThemeProps, "switchFilterName" | "switchLabel">;
        CcBackendMultiSelectWithTags: PartialExcept<BackendMultiSelectWithTagsThemeProps, "switchFilterNameGroup" | "switchFilterNameData" | "switchLabel">;
        CcMultiSelectEntry: Partial<MultiSelectEntryProps<MultiSelectorData>>;
        CcMultiSelect: PartialExcept<MultiSelectProps<MultiSelectorData>, "displaySwitch" | "switchLabel">;
        CcImageDots: Partial<ImageDotsProps>;
        CcImageBox: Partial<ImageBoxProps>;
        CcImageDialogEntry: Partial<ImageDialogEntryProps>;
        CcCollapsibleMenu: Partial<CollapsibleMenuProps>;
        CcCenteredTypography: Partial<CenteredTypographyProps>;
        CcMultiImage: Partial<MultiImageProps>;
        CcPortalLayoutMenu: Partial<PortalLayoutMenuProps>;
        CcSignPadDialog: Partial<SignPadDialogProps>;
        CcMenuItemJumboReactLight: Partial<MenuItemJumboReactLightProps>;
        CcMenuItemJumboReactDark: Partial<MenuItemJumboReactDarkProps>;
        CcFile: Partial<FileProps>;
        CcDialogTitle: Partial<DialogTitleProps>;
        CcFileUpload: Partial<FileUploadProps>;
        CcCrudLoadStatus: Partial<CrudLoadStatusProps>;
        CcImageSelector: Partial<ImageSelectorProps>;
        CcImagePreviewDialog: Partial<ImagePreviewDialogProps>;
        CcPortalMenu: Partial<PortalMenuProps>;
        CcMenuItemMaterial: Partial<MenuItemMaterialProps>;
        CcLocalizedKeyboardDatePicker: Partial<LocalizedKeyboardDatePickerProps>;
        CcComponentWithLabel: Partial<ComponentWithLabelProps>;
        CcCheckbox: Partial<CheckboxProps>;
        CcUiKitInput: Partial<UiKitInputProps>;
        CcUiKitInputOutlined: Partial<UiKitInputOutlinedProps>;
        CcUiKitTextField: Partial<UiKitTextFieldProps>;
        CcLocaleSelectorDialog: Partial<LocaleSelectorDialogProps>;
        CcLocaleSelectorDialogContent: Partial<LocaleSelectorDialogContentProps>;
        CcLocaleSelectorEntry: Partial<LocaleSelectorEntryProps>;
        CcSignPad: Partial<SignPadProps>;
        CcFormDialog: Partial<FormDialogProps>;
        CcPageTitle: Partial<PageTitleProps>;
        CcPopupMenu: Partial<PopupMenuProps>;
        CcPortalLayout: Partial<PortalLayoutProps>;
        CcInfiniteScroll: Partial<InfiniteScrollProps>;
        CcNotifications: Partial<NotificationsProps>;
        CcToast: Partial<ToastProps>;
        CcMultiSelectWithTags: PartialExcept<MultiSelectWithTagsProps<MultiSelectorData, BaseSelectorData>, "displaySwitch" | "switchLabel">;
        CcMultiSelectWithoutGroup: PartialExcept<MultiSelectWithoutGroupProps<BaseSelectorData>, "displaySwitch" | "switchLabel">;
        CcDayContents: Partial<DayContentsProps>;
        CcWeekViewDay: Partial<WeekViewDayProps>;
        CcScrollableSchedule: Partial<ScrollableScheduleProps>;
        CcScrollableScheduleDay: Partial<ScrollableScheduleDayProps>;
        CcWeekView: Partial<WeekViewProps>;
        CcDataGrid: Partial<DataGridProps>;
        CcGridMultiSelectFilter: Partial<GridMultiSelectFilterProps>;
        CcGridMultiSelectFilterBackend: PartialExcept<GridMultiSelectFilterBackendProps<ModelUnknown, MultiSelectorData>, "switchFilterName" | "switchLabel">;
        CcGridSingleSelectFilter: Partial<GridSingleSelectFilterProps>;
        CcGridSingleSelectFilterBackend: PartialExcept<GridSingleSelectFilterBackendProps<ModelUnknown>, "switchFilterName" | "switchLabel">;
        CcBasicFormPage: Partial<BasicFormPageProps<never, never>>;
        CcFormAutoSave: Partial<FormAutoSaveProps>;
        CcFlowEngine: Partial<FlowEngineThemeProps>;
        CcRoutedTabs: Partial<RoutedTabsProps>;
    }
    interface Components {
        CcSignalPortlet?: {
            defaultProps?: ComponentsPropsList["CcSignalPortlet"];
            styleOverrides?: StyleOverridesWithoutOwnerState<SignalPortletClassKey>;
        };
        CcSignalPortletItem?: {
            defaultProps?: ComponentsPropsList["CcSignalPortletItem"];
            styleOverrides?: StyleOverridesWithoutOwnerState<SignalPortletItemClassKey>;
        };
        /**
         * ActionButton. Recolor it with `defaultProps.color` (a palette color):
         * fill, text and hover then come from that color, the fill darkened or
         * lightened where the text would miss 4.5:1. A `backgroundColor` in
         * `styleOverrides.button` changes only the fill, and the text and hover
         * stay primary's.
         */
        CcActionButton?: {
            defaultProps?: ComponentsPropsList["CcActionButton"];
            styleOverrides?: StyleOverridesWithOwnerState<ActionButtonClassKey, ActionButtonOwnerState>;
            variants?: VariantsWithOwnerState<Omit<ActionButtonProps, "icon" | "small" | "children">, ActionButtonOwnerState>;
        };
        CcFormLoaderOverlay?: {
            defaultProps?: ComponentsPropsList["CcFormLoaderOverlay"];
            styleOverrides?: StyleOverridesWithoutOwnerState<FormLoaderOverlayClassKey>;
            variants?: VariantsWithoutOwnerState<Pick<FormLoaderOverlayProps, "visible">>;
        };
        CcLoader?: {
            defaultProps?: ComponentsPropsList["CcLoader"];
            styleOverrides?: StyleOverridesWithoutOwnerState<LoaderClassKey>;
            variants?: VariantsWithoutOwnerState<Omit<LoaderProps, "className" | "classes" | "aria-label" | "aria-labelledby">>;
        };
        CcMultiGrid?: {
            defaultProps?: ComponentsPropsList["CcMultiGrid"];
            styleOverrides?: StyleOverridesWithoutOwnerState<MultiGridClassKey>;
        };
        CcVerticalDivider?: {
            defaultProps?: ComponentsPropsList["CcVerticalDivider"];
            styleOverrides?: StyleOverridesWithoutOwnerState<VerticalDividerClassKey>;
            variants?: VariantsWithoutOwnerState<Omit<VerticalDividerProps, "className">>;
        };
        CcSmallIconButton?: {
            defaultProps?: ComponentsPropsList["CcSmallIconButton"];
            styleOverrides?: StyleOverridesWithoutOwnerState<SmallIconButtonClassKey>;
            variants?: VariantsWithoutOwnerState<SmallIconButtonProps>;
        };
        CcSmallestIconButton?: {
            defaultProps?: ComponentsPropsList["CcSmallestIconButton"];
            styleOverrides?: StyleOverridesWithoutOwnerState<SmallestIconButtonClassKey>;
            variants?: VariantsWithoutOwnerState<SmallestIconButtonProps>;
        };
        CcSmallListItem?: {
            defaultProps?: ComponentsPropsList["CcSmallListItem"];
            styleOverrides?: StyleOverridesWithoutOwnerState<SmallListItemClassKey>;
            variants?: VariantsWithoutOwnerState<SmallListItemProps>;
        };
        CcSmallListItemButton?: {
            defaultProps?: ComponentsPropsList["CcSmallListItemButton"];
            styleOverrides?: StyleOverridesWithoutOwnerState<SmallListItemButtonClassKey>;
            variants?: VariantsWithoutOwnerState<SmallListItemButtonProps>;
        };
        CcSelectorSmallListItem?: {
            defaultProps?: ComponentsPropsList["CcSelectorSmallListItem"];
            styleOverrides?: StyleOverridesWithoutOwnerState<SelectorSmallListItemClassKey>;
            variants?: VariantsWithoutOwnerState<SelectorSmallListItemProps>;
        };
        CcSelectorSmallListItemButton?: {
            defaultProps?: ComponentsPropsList["CcSelectorSmallListItemButton"];
            styleOverrides?: StyleOverridesWithoutOwnerState<SelectorSmallListItemButtonClassKey>;
            variants?: VariantsWithoutOwnerState<SelectorSmallListItemButtonProps>;
        };
        CcSmallListItemIcon?: {
            defaultProps?: ComponentsPropsList["CcSmallListItemIcon"];
            styleOverrides?: StyleOverridesWithoutOwnerState<SmallListItemIconClassKey>;
            variants?: VariantsWithoutOwnerState<SmallListItemIconProps>;
        };
        CcCountryFlag?: {
            defaultProps?: ComponentsPropsList["CcCountryFlag"];
            styleOverrides?: StyleOverridesWithoutOwnerState<CountryFlagClassKey>;
            variants?: VariantsWithoutOwnerState<Omit<CountryFlagProps, "className" | "classes" | "style">>;
        };
        CcMultiLanguageInput?: {
            defaultProps?: ComponentsPropsList["CcMultiLanguageInput"];
            styleOverrides?: StyleOverridesWithOptionalOwnerState<MultiLanguageInputClassKey, MultiLanguageInputLanguageLabelOwnerState>;
        };
        CcFormButtons?: {
            defaultProps?: ComponentsPropsList["CcFormButtons"];
            styleOverrides?: StyleOverridesWithoutOwnerState<FormButtonsClassKey>;
        };
        CcDefaultFormPageButtons?: {
            defaultProps?: ComponentsPropsList["CcDefaultFormPageButtons"];
            styleOverrides?: StyleOverridesWithoutOwnerState<DefaultFormPageButtonsClassKey>;
        };
        CcSubActionButton?: {
            defaultProps?: ComponentsPropsList["CcSubActionButton"];
            styleOverrides?: StyleOverridesWithOwnerState<SubActionButtonClassKey, SubActionButtonOwnerState>;
            variants?: VariantsWithOwnerState<Omit<SubActionButtonProps, "icon" | "small" | "disableDivider" | "children">, SubActionButtonOwnerState>;
        };
        CcGroupBox?: {
            defaultProps?: ComponentsPropsList["CcGroupBox"];
            styleOverrides?: StyleOverridesWithoutOwnerState<GroupBoxClassKey>;
            variants?: VariantsWithoutOwnerState<Omit<GroupBoxProps, "children" | "className" | "classes">>;
        };
        CcMatrixGrid?: {
            defaultProps?: ComponentsPropsList["CcMatrixGrid"];
            styleOverrides?: StyleOverridesWithoutOwnerState<MatrixGridClassKey>;
        };
        CcMatrixCellTile?: {
            defaultProps?: ComponentsPropsList["CcMatrixCellTile"];
            styleOverrides?: StyleOverridesWithoutOwnerState<MatrixCellTileClassKey>;
        };
        CcHowToBox?: {
            defaultProps?: ComponentsPropsList["CcHowToBox"];
            styleOverrides?: StyleOverridesWithoutOwnerState<HowToBoxClassKey>;
            variants?: VariantsWithoutOwnerState<Pick<HowToBoxProps, "titleLabel" | "labels" | "ordered">>;
        };
        CcInfoBox?: {
            defaultProps?: ComponentsPropsList["CcInfoBox"];
            styleOverrides?: StyleOverridesWithoutOwnerState<InfoBoxClassKey>;
        };
        CcFormPageLayout?: {
            defaultProps?: ComponentsPropsList["CcFormPageLayout"];
            styleOverrides?: StyleOverridesWithoutOwnerState<FormPageLayoutClassKey>;
        };
        CcInlineSwitch?: {
            defaultProps?: ComponentsPropsList["CcInlineSwitch"];
            styleOverrides?: StyleOverridesWithoutOwnerState<InlineSwitchClassKey>;
        };
        CcBackendSingleSelect?: {
            defaultProps?: ComponentsPropsList["CcBackendSingleSelect"];
        };
        CcBackendMultiSelect?: {
            defaultProps?: ComponentsPropsList["CcBackendMultiSelect"];
        };
        CcBackendMultipleSelect?: {
            defaultProps?: ComponentsPropsList["CcBackendMultipleSelect"];
        };
        CcBackendMultiSelectWithTags?: {
            defaultProps?: ComponentsPropsList["CcBackendMultiSelectWithTags"];
        };
        CcBackendDataGridMultiSelect?: {
            styleOverrides?: StyleOverridesWithoutOwnerState<BackendDataGridMultiSelectClassKey>;
        };
        CcBaseSelector?: {
            defaultProps?: ComponentsPropsList["CcBaseSelector"];
            styleOverrides?: StyleOverridesWithOptionalOwnerState<BaseSelectorClassKey, BaseSelectorIconOwnerState>;
        };
        CcMultiSelectEntry?: {
            defaultProps?: ComponentsPropsList["CcMultiSelectEntry"];
            styleOverrides?: StyleOverridesWithOptionalOwnerState<MultiSelectEntryClassKey, MultiSelectEntrySelectedOwnerState & MultiSelectEntryImageOwnerState>;
        };
        CcMultiSelect?: {
            defaultProps?: ComponentsPropsList["CcMultiSelect"];
            styleOverrides?: StyleOverridesWithOptionalOwnerState<MultiSelectClassKey, MultiSelectSelectorOwnerState>;
        };
        CcImageDots?: {
            defaultProps?: ComponentsPropsList["CcImageDots"];
            styleOverrides?: StyleOverridesWithoutOwnerState<ImageDotsClassKey>;
        };
        CcImageBox?: {
            defaultProps?: ComponentsPropsList["CcImageBox"];
            styleOverrides?: StyleOverridesWithOptionalOwnerState<ImageBoxClassKey, ImageBoxRootOwnerState & ImageBoxStyledImageOwnerState>;
            variants?: VariantsWithOwnerState<Pick<ImageBoxProps, never>, ImageBoxRootOwnerState>;
        };
        CcImageDialogEntry?: {
            defaultProps?: ComponentsPropsList["CcImageDialogEntry"];
            styleOverrides?: StyleOverridesWithoutOwnerState<ImageDialogEntryClassKey>;
        };
        CcCollapsibleMenu?: {
            defaultProps?: ComponentsPropsList["CcCollapsibleMenu"];
            styleOverrides?: StyleOverridesWithoutOwnerState<CollapsibleMenuClassKey>;
        };
        CcCenteredTypography?: {
            defaultProps?: ComponentsPropsList["CcCenteredTypography"];
            styleOverrides?: StyleOverridesWithoutOwnerState<CenteredTypographyClassKey>;
        };
        CcMultiImage?: {
            defaultProps?: ComponentsPropsList["CcMultiImage"];
            styleOverrides?: StyleOverridesWithoutOwnerState<MultiImageClassKey>;
        };
        CcPortalLayoutMenu?: {
            defaultProps?: ComponentsPropsList["CcPortalLayoutMenu"];
            styleOverrides?: StyleOverridesWithoutOwnerState<PortalLayoutMenuClassKey>;
        };
        CcSignPadDialog?: {
            defaultProps?: ComponentsPropsList["CcSignPadDialog"];
            styleOverrides?: StyleOverridesWithoutOwnerState<SignPadDialogClassKey>;
        };
        CcMenuItemJumboReactLight?: {
            defaultProps?: ComponentsPropsList["CcMenuItemJumboReactLight"];
            styleOverrides?: StyleOverridesWithoutOwnerState<MenuItemJumboReactLightClassKey>;
            variants?: VariantsWithoutOwnerState<Pick<PortalMenuItemProps, "onClick" | "onAuxClick">>;
        };
        CcMenuItemJumboReactDark?: {
            defaultProps?: ComponentsPropsList["CcMenuItemJumboReactDark"];
            styleOverrides?: StyleOverridesWithoutOwnerState<MenuItemJumboReactDarkClassKey>;
            variants?: VariantsWithoutOwnerState<Pick<PortalMenuItemProps, "onClick" | "onAuxClick">>;
        };
        CcFile?: {
            defaultProps?: ComponentsPropsList["CcFile"];
            styleOverrides?: StyleOverridesWithoutOwnerState<FileClassKey>;
        };
        CcDialogTitle?: {
            defaultProps?: ComponentsPropsList["CcDialogTitle"];
            styleOverrides?: StyleOverridesWithoutOwnerState<DialogTitleClassKey>;
        };
        CcFileUpload?: {
            defaultProps?: ComponentsPropsList["CcFileUpload"];
            styleOverrides?: StyleOverridesWithoutOwnerState<FileUploadClassKey>;
            variants?: VariantsWithoutOwnerState<Pick<FileUploadProps, "smallLabel">>;
        };
        CcCrudLoadStatus?: {
            defaultProps?: ComponentsPropsList["CcCrudLoadStatus"];
            styleOverrides?: StyleOverridesWithoutOwnerState<CrudLoadStatusClassKey>;
        };
        CcImageSelector?: {
            defaultProps?: ComponentsPropsList["CcImageSelector"];
            styleOverrides?: StyleOverridesWithoutOwnerState<ImageSelectorClassKey>;
        };
        CcImagePreviewDialog?: {
            defaultProps?: ComponentsPropsList["CcImagePreviewDialog"];
            styleOverrides?: StyleOverridesWithoutOwnerState<ImagePreviewDialogClassKey>;
            variants?: VariantsWithoutOwnerState<Pick<ImagePreviewDialogProps, "open" | "onClose">>;
        };
        CcPortalMenu?: {
            defaultProps?: ComponentsPropsList["CcPortalMenu"];
            styleOverrides?: StyleOverridesWithoutOwnerState<PortalMenuClassKey>;
        };
        CcMenuItemMaterial?: {
            defaultProps?: ComponentsPropsList["CcMenuItemMaterial"];
            styleOverrides?: StyleOverridesWithoutOwnerState<MenuItemMaterialClassKey>;
            variants?: VariantsWithoutOwnerState<Pick<PortalMenuItemProps, "onClick" | "onAuxClick">>;
        };
        CcLocalizedKeyboardDatePicker?: {
            defaultProps?: ComponentsPropsList["CcLocalizedKeyboardDatePicker"];
            styleOverrides?: StyleOverridesWithoutOwnerState<LocalizedKeyboardDatePickerClassKey>;
        };
        CcComponentWithLabel?: {
            defaultProps?: ComponentsPropsList["CcComponentWithLabel"];
            styleOverrides?: StyleOverridesWithoutOwnerState<ComponentWithLabelClassKey>;
            variants?: VariantsWithoutOwnerState<Omit<ComponentWithLabelProps, "labelText" | "labelVariant" | "labelDisplay" | "labelAlign">>;
        };
        CcCheckbox?: {
            defaultProps?: ComponentsPropsList["CcCheckbox"];
            styleOverrides?: StyleOverridesWithoutOwnerState<CheckboxClassKey>;
            variants?: VariantsWithoutOwnerState<CheckboxProps>;
        };
        CcUiKitInput?: {
            defaultProps?: ComponentsPropsList["CcUiKitInput"];
            styleOverrides?: StyleOverridesWithoutOwnerState<UiKitInputClassKey>;
            variants?: VariantsWithoutOwnerState<UiKitInputProps>;
        };
        CcUiKitInputOutlined?: {
            defaultProps?: ComponentsPropsList["CcUiKitInputOutlined"];
            styleOverrides?: StyleOverridesWithoutOwnerState<UiKitInputOutlinedClassKey>;
            variants?: VariantsWithoutOwnerState<UiKitInputOutlinedProps>;
        };
        CcUiKitTextField?: {
            defaultProps?: ComponentsPropsList["CcUiKitTextField"];
            styleOverrides?: StyleOverridesWithoutOwnerState<UiKitTextFieldClassKey>;
            variants?: VariantsWithoutOwnerState<UiKitTextFieldProps>;
        };
        CcLocaleSelectorDialog?: {
            defaultProps?: ComponentsPropsList["CcLocaleSelectorDialog"];
            styleOverrides?: StyleOverridesWithoutOwnerState<LocaleSelectorDialogClassKey>;
        };
        CcLocaleSelectorDialogContent?: {
            defaultProps?: ComponentsPropsList["CcLocaleSelectorDialogContent"];
            styleOverrides?: StyleOverridesWithoutOwnerState<LocaleSelectorDialogContentClassKey>;
        };
        CcLocaleSelectorEntry?: {
            defaultProps?: ComponentsPropsList["CcLocaleSelectorEntry"];
            styleOverrides?: StyleOverridesWithoutOwnerState<LocaleSelectorEntryClassKey>;
            variants?: VariantsWithoutOwnerState<Pick<LocaleSelectorEntryProps, "disabled" | "className">>;
        };
        CcSignPad?: {
            defaultProps?: ComponentsPropsList["CcSignPad"];
            styleOverrides?: StyleOverridesWithoutOwnerState<SignPadClassKey>;
        };
        CcFormDialog?: {
            defaultProps?: ComponentsPropsList["CcFormDialog"];
            styleOverrides?: StyleOverridesWithoutOwnerState<FormDialogClassKey>;
        };
        CcPageTitle?: {
            defaultProps?: ComponentsPropsList["CcPageTitle"];
            styleOverrides?: StyleOverridesWithoutOwnerState<PageTitleClassKey>;
            variants?: VariantsWithoutOwnerState<Omit<PageTitleProps, "disableAutoTitle">>;
        };
        CcPopupMenu?: {
            defaultProps?: ComponentsPropsList["CcPopupMenu"];
            styleOverrides?: StyleOverridesWithoutOwnerState<PopupMenuClassKey>;
            variants?: VariantsWithoutOwnerState<Omit<PopupMenuProps, "slotProps">>;
        };
        CcFilesGrid?: {
            styleOverrides?: StyleOverridesWithoutOwnerState<FilesGridClassKey>;
        };
        CcPortalLayout?: {
            defaultProps?: ComponentsPropsList["CcPortalLayout"];
            styleOverrides?: StyleOverridesWithOwnerState<PortalLayoutClassKey, PortalLayoutContainerOwnerState>;
        };
        CcInfiniteScroll?: {
            defaultProps?: ComponentsPropsList["CcInfiniteScroll"];
            styleOverrides?: StyleOverridesWithoutOwnerState<InfiniteScrollClassKey>;
            variants?: VariantsWithoutOwnerState<Omit<InfiniteScrollProps, "children" | "loadMoreTop" | "loadMoreBottom" | "loading" | "threshold" | "callBackDebounce">>;
        };
        CcNotifications?: {
            defaultProps?: ComponentsPropsList["CcNotifications"];
            styleOverrides?: StyleOverridesWithoutOwnerState<NotificationsClassKey>;
        };
        CcToast?: {
            defaultProps?: ComponentsPropsList["CcToast"];
            styleOverrides?: StyleOverridesWithoutOwnerState<ToastClassKey>;
            variants?: VariantsWithoutOwnerState<Pick<ToastProps, "open" | "anchorOrigin" | "autoHideDuration">>;
        };
        CcMultiSelectWithTags?: {
            defaultProps?: ComponentsPropsList["CcMultiSelectWithTags"];
            styleOverrides?: StyleOverridesWithoutOwnerState<MultiSelectWithTagsClassKey>;
        };
        CcMultiSelectWithoutGroup?: {
            defaultProps?: ComponentsPropsList["CcMultiSelectWithoutGroup"];
            styleOverrides?: StyleOverridesWithoutOwnerState<MultiSelectWithoutGroupClassKey>;
        };
        CcDayContents?: {
            defaultProps?: ComponentsPropsList["CcDayContents"];
            styleOverrides?: StyleOverridesWithOwnerState<DayContentsClassKey, DayContentsButtonOwnerState>;
        };
        CcWeekViewDay?: {
            defaultProps?: ComponentsPropsList["CcWeekViewDay"];
            styleOverrides?: StyleOverridesWithoutOwnerState<WeekViewDayClassKey>;
        };
        CcScrollableSchedule?: {
            defaultProps?: ComponentsPropsList["CcScrollableSchedule"];
            styleOverrides?: StyleOverridesWithoutOwnerState<ScrollableScheduleClassKey>;
        };
        CcScrollableScheduleDay?: {
            defaultProps?: ComponentsPropsList["CcScrollableScheduleDay"];
            styleOverrides?: StyleOverridesWithoutOwnerState<ScrollableScheduleDayClassKey>;
        };
        CcWeekView?: {
            defaultProps?: ComponentsPropsList["CcWeekView"];
            styleOverrides?: StyleOverridesWithoutOwnerState<WeekViewClassKey>;
            variants?: VariantsWithoutOwnerState<Pick<WeekViewProps, "className">>;
        };
        CcDataGrid?: {
            defaultProps?: ComponentsPropsList["CcDataGrid"];
            styleOverrides?: StyleOverridesWithoutOwnerState<DataGridClassKey>;
        };
        CcGridMultiSelectFilter?: {
            defaultProps?: ComponentsPropsList["CcGridMultiSelectFilter"];
            styleOverrides?: StyleOverridesWithoutOwnerState<GridMultiSelectFilterClassKey>;
        };
        CcGridMultiSelectFilterBackend?: {
            defaultProps?: ComponentsPropsList["CcGridMultiSelectFilterBackend"];
            styleOverrides?: StyleOverridesWithoutOwnerState<GridMultiSelectFilterBackendClassKey>;
        };
        CcGridSingleSelectFilter?: {
            defaultProps?: ComponentsPropsList["CcGridSingleSelectFilter"];
            styleOverrides?: StyleOverridesWithoutOwnerState<GridSingleSelectFilterClassKey>;
        };
        CcGridSingleSelectFilterBackend?: {
            defaultProps?: ComponentsPropsList["CcGridSingleSelectFilterBackend"];
            styleOverrides?: StyleOverridesWithoutOwnerState<GridSingleSelectFilterBackendClassKey>;
        };
        CcForm?: {
            styleOverrides?: StyleOverridesWithoutOwnerState<FormClassKey>;
        };
        CcFieldState?: {
            styleOverrides?: StyleOverridesWithoutOwnerState<FieldStateClassKey>;
        };
        CcDirtyMarker?: {
            styleOverrides?: StyleOverridesWithoutOwnerState<DirtyMarkerClassKey>;
        };
        CcFormTab?: {
            styleOverrides?: StyleOverridesWithoutOwnerState<FormTabClassKey>;
        };
        CcFormAutoSave?: {
            defaultProps?: ComponentsPropsList["CcFormAutoSave"];
            styleOverrides?: StyleOverridesWithoutOwnerState<FormAutoSaveClassKey>;
        };
        CcBasicFormPage?: {
            defaultProps?: ComponentsPropsList["CcBasicFormPage"];
        };
        CcFlowEngine?: {
            defaultProps?: ComponentsPropsList["CcFlowEngine"];
            styleOverrides?: StyleOverridesWithoutOwnerState<FlowEngineClassKey>;
        };
        CcCrud?: {
            styleOverrides?: StyleOverridesWithoutOwnerState<CrudClassKey>;
        };
        CcRoutedTabs?: {
            defaultProps?: ComponentsPropsList["CcRoutedTabs"];
            styleOverrides?: StyleOverridesWithoutOwnerState<RoutedTabsClassKey>;
        };
        CcRoutedTabPanelWrapper?: {
            styleOverrides?: StyleOverridesWithoutOwnerState<RoutedTabPanelWrapperClassKey>;
        };
    }
}
export {};
