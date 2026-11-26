import { PortalMenuClassKey, PortalMenuProps } from "./standalone/Portal/Menu";
import {
	FileUploadClassKey,
	FileUploadProps,
} from "./standalone/FileUpload/Generic";
import {
	ImageSelectorClassKey,
	ImageSelectorProps,
} from "./standalone/FileUpload/Image/ImageSelector";
import {
	ImagePreviewDialogClassKey,
	ImagePreviewDialogProps,
} from "./standalone/FileUpload/Image/ImagePreviewDialog";
import {
	MultiImageClassKey,
	MultiImageProps,
} from "./standalone/FileUpload/MultiImage/MultiImage";
import {
	BaseSelectorClassKey,
	BaseSelectorData,
	BaseSelectorThemeProps,
	HowToBoxClassKey,
	HowToBoxProps,
	MultiSelectClassKey,
	MultiSelectorData,
	MultiSelectProps,
	MultiSelectWithoutGroupClassKey,
	MultiSelectWithoutGroupProps,
	MultiSelectWithTagsClassKey,
	MultiSelectWithTagsProps,
	PopupMenuClassKey,
	PopupMenuProps,
	PortalLayoutClassKey,
	PortalLayoutProps,
} from "./standalone";
import {
	SmallIconButtonClassKey,
	SmallIconButtonProps,
	SmallestIconButtonClassKey,
	SmallestIconButtonProps,
	SmallListItemClassKey,
	SmallListItemProps,
	SmallListItemButtonClassKey,
	SmallListItemButtonProps,
	SelectorSmallListItemClassKey,
	SelectorSmallListItemProps,
	SelectorSmallListItemButtonClassKey,
	SelectorSmallListItemButtonProps,
	SmallListItemIconClassKey,
	SmallListItemIconProps,
} from "./standalone/Small";
import {
	ComponentWithLabelClassKey,
	ComponentWithLabelProps,
} from "./standalone/UIKit/ComponentWithLabel";
import { CheckboxClassKey } from "./standalone/UIKit/Checkbox";
import {
	ActionButtonClassKey,
	ActionButtonOwnerState,
	ActionButtonProps,
} from "./standalone/UIKit/ActionButton";
import {
	SubActionButtonClassKey,
	SubActionButtonOwnerState,
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
	MatrixCellTileClassKey,
	MatrixCellTileProps,
	MatrixGridClassKey,
	MatrixGridProps,
} from "./standalone/Matrix";
import {
	SignalPortletClassKey,
	SignalPortletProps,
} from "./standalone/SignalPortlet";
import {
	CheckboxProps,
	ComponentsOverrides,
	ComponentsVariants,
	Interpolation,
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
	CountryFlagClassKey,
	CountryFlagProps,
} from "./standalone/CountryFlag";
import {
	MultiLanguageInputClassKey,
	MultiLanguageInputProps,
} from "./standalone/UIKit/InputControls/MultiLanguageInput";
import {
	DefaultFormPageButtonsClassKey,
	DefaultFormPageButtonsProps,
} from "./backend-components/Form/DefaultFormPageButtons";
import type { FilesGridClassKey } from "./backend-integration/Model/Types/Renderers/FilesGrid/FilesGrid";
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
import {
	CenteredTypographyClassKey,
	CenteredTypographyProps,
} from "./standalone/UIKit/CenteredTypography";
import {
	PortalLayoutMenuClassKey,
	PortalLayoutMenuProps,
} from "./standalone/Portal/Layout/Menu";
import {
	SignPadDialogClassKey,
	SignPadDialogProps,
} from "./non-standalone/Dialog/SignPadDialog";
import {
	DialogTitleClassKey,
	DialogTitleProps,
} from "./non-standalone/Dialog/DialogTitle";
import {
	MenuItemJumboReactLightClassKey,
	MenuItemJumboReactLightProps,
} from "./standalone/Portal/MenuItem/JumboReact/Light";
import {
	MenuItemJumboReactDarkClassKey,
	MenuItemJumboReactDarkProps,
} from "./standalone/Portal/MenuItem/JumboReact/Dark";
import { FileClassKey, FileProps } from "./standalone/FileUpload/Generic/File";
import {
	MenuItemMaterialClassKey,
	MenuItemMaterialProps,
} from "./standalone/Portal/MenuItem/Material";
import {
	LocalizedKeyboardDatePickerClassKey,
	LocalizedKeyboardDatePickerProps,
} from "./standalone/LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import {
	UiKitInputClassKey,
	UiKitInputOutlinedClassKey,
	UiKitInputOutlinedProps,
	UiKitInputProps,
	UiKitTextFieldClassKey,
	UiKitTextFieldProps,
} from "./standalone/UIKit/CommonStyles";
import {
	LocaleSelectorDialogClassKey,
	LocaleSelectorDialogProps,
} from "./non-standalone/LocaleSelector/LocaleSelectorDialog";
import {
	LocaleSelectorDialogContentClassKey,
	LocaleSelectorDialogContentProps,
} from "./non-standalone/LocaleSelector/LocaleSelectorDialogContent";
import {
	LocaleSelectorEntryClassKey,
	LocaleSelectorEntryProps,
} from "./non-standalone/LocaleSelector/LocaleSelectorEntry";
import { SignPadClassKey, SignPadProps } from "./standalone/SignPad";
import {
	FormDialogClassKey,
	FormDialogProps,
} from "./backend-components/Form/FormDialog";
import {
	PageTitleClassKey,
	PageTitleProps,
} from "./non-standalone/PageTitle/PageTitle";
import {
	NotificationsClassKey,
	NotificationsProps,
} from "./standalone/Notifications";
import { ToastClassKey, ToastProps } from "./standalone/Toast";
import {
	DayContentsClassKey,
	DayContentsProps,
} from "./standalone/Schedule/Common/DayContents";
import {
	WeekViewDayClassKey,
	WeekViewDayProps,
} from "./standalone/Schedule/Weekly/WeekViewDay";
import {
	ScrollableScheduleClassKey,
	ScrollableScheduleProps,
} from "./standalone/Schedule/Scrollable";
import { WeekViewClassKey, WeekViewProps } from "./standalone/Schedule/Weekly";
import {
	DataGridClassKey,
	DataGridProps,
} from "./standalone/DataGrid/DataGrid";
import {
	GridMultiSelectFilterClassKey,
	GridMultiSelectFilterProps,
} from "./standalone/DataGrid/GridMultiSelectFilter";
import {
	GridSingleSelectFilterClassKey,
	GridSingleSelectFilterProps,
} from "./standalone/DataGrid/GridSingleSelectFilter";
import {
	ScrollableScheduleDayClassKey,
	ScrollableScheduleDayProps,
} from "./standalone/Schedule/Scrollable/ScrollableScheduleDay";
import { FormClassKey } from "./backend-components";
import { BasicFormPageProps } from "./backend-components/Form/BasicFormPage";
import {
	FlowEngineClassKey,
	FlowEngineThemeProps,
} from "./backend-components/Form/FlowEngine/FlowEngine";
import {
	DirtyMarkerClassKey,
	FieldStateClassKey,
} from "./standalone/UIKit/MuiFieldState";
import { CrudClassKey } from "./backend-components/CRUD";
import { FormTabClassKey } from "./backend-components/Form/FormTab";
import {
	RoutedTabsClassKey,
	RoutedTabsProps,
} from "./non-standalone/RoutedTabs/RoutedTabs";
import { RoutedTabPanelWrapperClassKey } from "./non-standalone/RoutedTabs/RoutedTabPanelWrapper";
import {
	CrudLoadStatusClassKey,
	CrudLoadStatusProps,
} from "./backend-components/FileUpload/CrudLoadStatus";
import { BackendSingleSelectThemeProps } from "./backend-components/Selector/BackendSingleSelect";
import { BackendMultiSelectThemeProps } from "./backend-components/Selector/BackendMultiSelect";
import { BackendMultipleSelectThemeProps } from "./backend-components/Selector/BackendMultipleSelect";
import { BackendMultiSelectWithTagsThemeProps } from "./backend-components/Selector/BackendMultiSelectWithTags";
import { BackendDataGridMultiSelectClassKey } from "./backend-components/Selector/BackendDataGridMultiSelect";
import { PartialExcept } from "./utils/distributiveOmit";
import {
	GridSingleSelectFilterBackendClassKey,
	GridSingleSelectFilterBackendProps,
} from "./standalone/DataGrid/GridSingleSelectFilterBackend";
import { ModelUnknown } from "./backend-integration";
import {
	GridMultiSelectFilterBackendClassKey,
	GridMultiSelectFilterBackendProps,
} from "./standalone/DataGrid/GridMultiSelectFilterBackend";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComponentsCareTheme {}

declare module "@mui/material/styles" {
	interface Theme {
		componentsCare?: ComponentsCareTheme;
	}

	interface ThemeOptions {
		componentsCare?: ComponentsCareTheme;
	}
}

// start new styles

type Theme = Omit<MuiTheme, "components">;

/**
 * `styleOverrides` of a component that passes no `ownerState` to its slots.
 * MUI calls each function in it while styling every slot of the component,
 * with that slot's props, so a function can rely on the theme only.
 */
type StyleOverridesWithoutOwnerState<ClassKey extends string> = Partial<
	Record<ClassKey, Interpolation<{ theme: Theme }>>
>;

/**
 * `variants` of a component whose root gets `Props` directly and no
 * `ownerState`. MUI matches a variant's `props` against them and calls a
 * `props` function with them.
 */
type VariantsWithoutOwnerState<Props> = Array<{
	props: Partial<Props> | ((props: Partial<Props>) => boolean);
	style: Interpolation<{ theme: Theme }>;
}>;

/**
 * `styleOverrides` of a component that passes `OwnerState` to its slots as
 * their `ownerState`. MUI calls each function in it while styling every slot
 * of the component, with that slot's props.
 */
type StyleOverridesWithOwnerState<
	ClassKey extends string,
	OwnerState,
> = Partial<
	Record<ClassKey, Interpolation<{ theme: Theme; ownerState: OwnerState }>>
>;

/**
 * `variants` of a component whose root gets `Props` and `OwnerState` as its
 * `ownerState`. MUI matches each key of a variant's `props` against both,
 * and calls a `props` function with the props, the fields of `ownerState`
 * (which replace props of the same name) and `ownerState` itself.
 */
type VariantsWithOwnerState<Props, OwnerState> = Array<{
	props:
		| {
				[Key in keyof Props | keyof OwnerState]?:
					| (Key extends keyof Props ? Props[Key] : never)
					| (Key extends keyof OwnerState ? OwnerState[Key] : never);
		  }
		| ((
				props: Partial<Omit<Props, keyof OwnerState>> &
					OwnerState & { ownerState: OwnerState },
		  ) => boolean);
	style: Interpolation<{ theme: Theme }>;
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
		CcInlineSwitch: Partial<InlineSwitchProps>;
		// The selectors' defaults keep switchLabel required while they show the switch
		// (displaySwitch, switchFilterName…), as their props do: it is the switch's name.
		CcBaseSelector: PartialExcept<
			BaseSelectorThemeProps,
			"displaySwitch" | "switchLabel"
		>;
		CcBackendSingleSelect: PartialExcept<
			BackendSingleSelectThemeProps,
			"switchFilterName" | "switchLabel"
		>;
		CcBackendMultiSelect: PartialExcept<
			BackendMultiSelectThemeProps,
			"switchFilterName" | "switchLabel"
		>;
		CcBackendMultipleSelect: PartialExcept<
			BackendMultipleSelectThemeProps,
			"switchFilterName" | "switchLabel"
		>;
		CcBackendMultiSelectWithTags: PartialExcept<
			BackendMultiSelectWithTagsThemeProps,
			"switchFilterNameGroup" | "switchFilterNameData" | "switchLabel"
		>;
		CcMultiSelectEntry: Partial<MultiSelectEntryProps<MultiSelectorData>>;
		CcMultiSelect: PartialExcept<
			MultiSelectProps<MultiSelectorData>,
			"displaySwitch" | "switchLabel"
		>;
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
		CcNotifications: Partial<NotificationsProps>;
		CcToast: Partial<ToastProps>;
		CcMultiSelectWithTags: PartialExcept<
			MultiSelectWithTagsProps<MultiSelectorData, BaseSelectorData>,
			"displaySwitch" | "switchLabel"
		>;
		CcMultiSelectWithoutGroup: PartialExcept<
			MultiSelectWithoutGroupProps<BaseSelectorData>,
			"displaySwitch" | "switchLabel"
		>;
		CcDayContents: Partial<DayContentsProps>;
		CcWeekViewDay: Partial<WeekViewDayProps>;
		CcScrollableSchedule: Partial<ScrollableScheduleProps>;
		CcScrollableScheduleDay: Partial<ScrollableScheduleDayProps>;
		CcWeekView: Partial<WeekViewProps>;
		CcDataGrid: Partial<DataGridProps>;
		CcGridMultiSelectFilter: Partial<GridMultiSelectFilterProps>;
		CcGridMultiSelectFilterBackend: PartialExcept<
			GridMultiSelectFilterBackendProps<ModelUnknown, MultiSelectorData>,
			"switchFilterName" | "switchLabel"
		>;
		CcGridSingleSelectFilter: Partial<GridSingleSelectFilterProps>;
		CcGridSingleSelectFilterBackend: PartialExcept<
			GridSingleSelectFilterBackendProps<ModelUnknown>,
			"switchFilterName" | "switchLabel"
		>;
		CcBasicFormPage: Partial<BasicFormPageProps<never, never>>;
		CcFlowEngine: Partial<FlowEngineThemeProps>;
		CcRoutedTabs: Partial<RoutedTabsProps>;
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
		/**
		 * ActionButton. Recolor it with `defaultProps.color` (a palette color):
		 * fill, text and hover then come from that color, the fill darkened or
		 * lightened where the text would miss 4.5:1. A `backgroundColor` in
		 * `styleOverrides.button` changes only the fill, and the text and hover
		 * stay primary's.
		 */
		CcActionButton?: {
			defaultProps?: ComponentsPropsList["CcActionButton"];
			styleOverrides?: StyleOverridesWithOwnerState<
				ActionButtonClassKey,
				ActionButtonOwnerState
			>;
			// the button gets every prop but icon, small and children
			variants?: VariantsWithOwnerState<
				Omit<ActionButtonProps, "icon" | "small" | "children">,
				ActionButtonOwnerState
			>;
		};
		CcFormLoaderOverlay?: {
			defaultProps?: ComponentsPropsList["CcFormLoaderOverlay"];
			styleOverrides?: StyleOverridesWithoutOwnerState<FormLoaderOverlayClassKey>;
			// the root gets visible, and none of the other props
			variants?: VariantsWithoutOwnerState<
				Pick<FormLoaderOverlayProps, "visible">
			>;
		};
		CcLoader?: {
			defaultProps?: ComponentsPropsList["CcLoader"];
			styleOverrides?: StyleOverridesWithoutOwnerState<LoaderClassKey>;
			variants?: ComponentsVariants["CcLoader"];
		};
		CcMultiGrid?: {
			defaultProps?: ComponentsPropsList["CcMultiGrid"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MultiGridClassKey>;
			variants?: ComponentsVariants["CcMultiGrid"];
		};
		CcVerticalDivider?: {
			defaultProps?: ComponentsPropsList["CcVerticalDivider"];
			styleOverrides?: StyleOverridesWithoutOwnerState<VerticalDividerClassKey>;
			variants?: ComponentsVariants["CcVerticalDivider"];
		};
		CcSmallIconButton?: {
			defaultProps?: ComponentsPropsList["CcSmallIconButton"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SmallIconButtonClassKey>;
			variants?: ComponentsVariants["CcSmallIconButton"];
		};
		CcSmallestIconButton?: {
			defaultProps?: ComponentsPropsList["CcSmallestIconButton"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SmallestIconButtonClassKey>;
			variants?: ComponentsVariants["CcSmallestIconButton"];
		};
		CcSmallListItem?: {
			defaultProps?: ComponentsPropsList["CcSmallListItem"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SmallListItemClassKey>;
			variants?: ComponentsVariants["CcSmallListItem"];
		};
		CcSmallListItemButton?: {
			defaultProps?: ComponentsPropsList["CcSmallListItemButton"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SmallListItemButtonClassKey>;
			variants?: ComponentsVariants["CcSmallListItemButton"];
		};
		CcSelectorSmallListItem?: {
			defaultProps?: ComponentsPropsList["CcSelectorSmallListItem"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SelectorSmallListItemClassKey>;
			variants?: ComponentsVariants["CcSelectorSmallListItem"];
		};
		CcSelectorSmallListItemButton?: {
			defaultProps?: ComponentsPropsList["CcSelectorSmallListItemButton"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SelectorSmallListItemButtonClassKey>;
			variants?: ComponentsVariants["CcSelectorSmallListItemButton"];
		};
		CcSmallListItemIcon?: {
			defaultProps?: ComponentsPropsList["CcSmallListItemIcon"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SmallListItemIconClassKey>;
			variants?: ComponentsVariants["CcSmallListItemIcon"];
		};
		CcCountryFlag?: {
			defaultProps?: ComponentsPropsList["CcCountryFlag"];
			styleOverrides?: StyleOverridesWithoutOwnerState<CountryFlagClassKey>;
			variants?: ComponentsVariants["CcCountryFlag"];
		};
		CcMultiLanguageInput?: {
			defaultProps?: ComponentsPropsList["CcMultiLanguageInput"];
			styleOverrides?: ComponentsOverrides<Theme>["CcMultiLanguageInput"];
			variants?: ComponentsVariants["CcMultiLanguageInput"];
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of FormButtons' props.
		CcFormButtons?: {
			defaultProps?: ComponentsPropsList["CcFormButtons"];
			styleOverrides?: StyleOverridesWithoutOwnerState<FormButtonsClassKey>;
		};
		CcDefaultFormPageButtons?: {
			defaultProps?: ComponentsPropsList["CcDefaultFormPageButtons"];
			styleOverrides?: StyleOverridesWithoutOwnerState<DefaultFormPageButtonsClassKey>;
			variants?: ComponentsVariants["CcDefaultFormPageButtons"];
		};
		CcSubActionButton?: {
			defaultProps?: ComponentsPropsList["CcSubActionButton"];
			styleOverrides?: StyleOverridesWithOwnerState<
				SubActionButtonClassKey,
				SubActionButtonOwnerState
			>;
			// the button gets every prop but icon, small, disableDivider and children
			variants?: VariantsWithOwnerState<
				Omit<
					SubActionButtonProps,
					"icon" | "small" | "disableDivider" | "children"
				>,
				SubActionButtonOwnerState
			>;
		};
		CcGroupBox?: {
			defaultProps?: ComponentsPropsList["CcGroupBox"];
			styleOverrides?: StyleOverridesWithoutOwnerState<GroupBoxClassKey>;
			variants?: ComponentsVariants["CcGroupBox"];
		};
		CcMatrixGrid?: {
			defaultProps?: ComponentsPropsList["CcMatrixGrid"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MatrixGridClassKey>;
			variants?: ComponentsVariants["CcMatrixGrid"];
		};
		CcMatrixCellTile?: {
			defaultProps?: ComponentsPropsList["CcMatrixCellTile"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MatrixCellTileClassKey>;
			variants?: ComponentsVariants["CcMatrixCellTile"];
		};
		CcHowToBox?: {
			defaultProps?: ComponentsPropsList["CcHowToBox"];
			styleOverrides?: StyleOverridesWithoutOwnerState<HowToBoxClassKey>;
			variants?: VariantsWithoutOwnerState<
				Pick<HowToBoxProps, "titleLabel" | "labels">
			>;
		};
		CcInfoBox?: {
			defaultProps?: ComponentsPropsList["CcInfoBox"];
			styleOverrides?: ComponentsOverrides<Theme>["CcInfoBox"];
			variants?: ComponentsVariants["CcInfoBox"];
		};
		CcFormPageLayout?: {
			defaultProps?: ComponentsPropsList["CcFormPageLayout"];
			styleOverrides?: StyleOverridesWithoutOwnerState<FormPageLayoutClassKey>;
			variants?: ComponentsVariants["CcFormPageLayout"];
		};
		// No variants: MUI matches them against the root's own props and
		// ownerState, which hold none of InlineSwitch's props. A theme reaches
		// the props through the root's state classes (see InlineSwitchClassKey).
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
			styleOverrides?: StyleOverridesWithoutOwnerState<ImageDotsClassKey>;
			variants?: ComponentsVariants["CcImageDots"];
		};
		CcImageBox?: {
			defaultProps?: ComponentsPropsList["CcImageBox"];
			styleOverrides?: ComponentsOverrides<Theme>["CcImageBox"];
			variants?: ComponentsVariants["CcImageBox"];
		};
		CcImageDialogEntry?: {
			defaultProps?: ComponentsPropsList["CcImageDialogEntry"];
			styleOverrides?: StyleOverridesWithoutOwnerState<ImageDialogEntryClassKey>;
			variants?: ComponentsVariants["CcImageDialogEntry"];
		};
		CcCollapsibleMenu?: {
			defaultProps?: ComponentsPropsList["CcCollapsibleMenu"];
			styleOverrides?: StyleOverridesWithoutOwnerState<CollapsibleMenuClassKey>;
			variants?: ComponentsVariants["CcCollapsibleMenu"];
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of CenteredTypography's props.
		CcCenteredTypography?: {
			defaultProps?: ComponentsPropsList["CcCenteredTypography"];
			styleOverrides?: StyleOverridesWithoutOwnerState<CenteredTypographyClassKey>;
		};
		CcMultiImage?: {
			defaultProps?: ComponentsPropsList["CcMultiImage"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MultiImageClassKey>;
			variants?: ComponentsVariants["CcMultiImage"];
		};
		CcPortalLayoutMenu?: {
			defaultProps?: ComponentsPropsList["CcPortalLayoutMenu"];
			styleOverrides?: StyleOverridesWithoutOwnerState<PortalLayoutMenuClassKey>;
			variants?: ComponentsVariants["CcPortalLayoutMenu"];
		};
		CcSignPadDialog?: {
			defaultProps?: ComponentsPropsList["CcSignPadDialog"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SignPadDialogClassKey>;
			variants?: ComponentsVariants["CcSignPadDialog"];
		};
		CcMenuItemJumboReactLight?: {
			defaultProps?: ComponentsPropsList["CcMenuItemJumboReactLight"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MenuItemJumboReactLightClassKey>;
			variants?: ComponentsVariants["CcMenuItemJumboReactLight"];
		};
		CcMenuItemJumboReactDark?: {
			defaultProps?: ComponentsPropsList["CcMenuItemJumboReactDark"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MenuItemJumboReactDarkClassKey>;
			variants?: ComponentsVariants["CcMenuItemJumboReactDark"];
		};
		CcFile?: {
			defaultProps?: ComponentsPropsList["CcFile"];
			styleOverrides?: StyleOverridesWithoutOwnerState<FileClassKey>;
			variants?: ComponentsVariants["CcFile"];
		};
		CcDialogTitle?: {
			defaultProps?: ComponentsPropsList["CcDialogTitle"];
			styleOverrides?: StyleOverridesWithoutOwnerState<DialogTitleClassKey>;
			variants?: ComponentsVariants["CcDialogTitle"];
		};
		CcFileUpload?: {
			defaultProps?: ComponentsPropsList["CcFileUpload"];
			styleOverrides?: StyleOverridesWithoutOwnerState<FileUploadClassKey>;
			variants?: ComponentsVariants["CcFileUpload"];
		};
		CcCrudLoadStatus?: {
			defaultProps?: ComponentsPropsList["CcCrudLoadStatus"];
			styleOverrides?: StyleOverridesWithoutOwnerState<CrudLoadStatusClassKey>;
			variants?: ComponentsVariants["CcCrudLoadStatus"];
		};
		CcImageSelector?: {
			defaultProps?: ComponentsPropsList["CcImageSelector"];
			styleOverrides?: StyleOverridesWithoutOwnerState<ImageSelectorClassKey>;
			variants?: ComponentsVariants["CcImageSelector"];
		};
		CcImagePreviewDialog?: {
			defaultProps?: ComponentsPropsList["CcImagePreviewDialog"];
			styleOverrides?: StyleOverridesWithoutOwnerState<ImagePreviewDialogClassKey>;
			variants?: ComponentsVariants["CcImagePreviewDialog"];
		};
		CcPortalMenu?: {
			defaultProps?: ComponentsPropsList["CcPortalMenu"];
			styleOverrides?: StyleOverridesWithoutOwnerState<PortalMenuClassKey>;
			variants?: ComponentsVariants["CcPortalMenu"];
		};
		CcMenuItemMaterial?: {
			defaultProps?: ComponentsPropsList["CcMenuItemMaterial"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MenuItemMaterialClassKey>;
			variants?: ComponentsVariants["CcMenuItemMaterial"];
		};
		CcLocalizedKeyboardDatePicker?: {
			defaultProps?: ComponentsPropsList["CcLocalizedKeyboardDatePicker"];
			styleOverrides?: ComponentsOverrides<Theme>["CcLocalizedKeyboardDatePicker"];
			variants?: ComponentsVariants["CcLocalizedKeyboardDatePicker"];
		};
		CcComponentWithLabel?: {
			defaultProps?: ComponentsPropsList["CcComponentWithLabel"];
			styleOverrides?: StyleOverridesWithoutOwnerState<ComponentWithLabelClassKey>;
			// the root gets every prop but the caption's, which make up its label
			variants?: VariantsWithoutOwnerState<
				Omit<
					ComponentWithLabelProps,
					"labelText" | "labelVariant" | "labelDisplay" | "labelAlign"
				>
			>;
		};
		CcCheckbox?: {
			defaultProps?: ComponentsPropsList["CcCheckbox"];
			styleOverrides?: StyleOverridesWithoutOwnerState<CheckboxClassKey>;
			variants?: VariantsWithoutOwnerState<CheckboxProps>;
		};
		CcUiKitInput?: {
			defaultProps?: ComponentsPropsList["CcUiKitInput"];
			styleOverrides?: StyleOverridesWithoutOwnerState<UiKitInputClassKey>;
			variants?: ComponentsVariants["CcUiKitInput"];
		};
		CcUiKitInputOutlined?: {
			defaultProps?: ComponentsPropsList["CcUiKitInputOutlined"];
			styleOverrides?: StyleOverridesWithoutOwnerState<UiKitInputOutlinedClassKey>;
			variants?: ComponentsVariants["CcUiKitInputOutlined"];
		};
		CcUiKitTextField?: {
			defaultProps?: ComponentsPropsList["CcUiKitTextField"];
			styleOverrides?: StyleOverridesWithoutOwnerState<UiKitTextFieldClassKey>;
			variants?: ComponentsVariants["CcUiKitTextField"];
		};
		CcLocaleSelectorDialog?: {
			defaultProps?: ComponentsPropsList["CcLocaleSelectorDialog"];
			styleOverrides?: StyleOverridesWithoutOwnerState<LocaleSelectorDialogClassKey>;
			variants?: ComponentsVariants["CcLocaleSelectorDialog"];
		};
		CcLocaleSelectorDialogContent?: {
			defaultProps?: ComponentsPropsList["CcLocaleSelectorDialogContent"];
			styleOverrides?: StyleOverridesWithoutOwnerState<LocaleSelectorDialogContentClassKey>;
			variants?: ComponentsVariants["CcLocaleSelectorDialogContent"];
		};
		CcLocaleSelectorEntry?: {
			defaultProps?: ComponentsPropsList["CcLocaleSelectorEntry"];
			styleOverrides?: StyleOverridesWithoutOwnerState<LocaleSelectorEntryClassKey>;
			variants?: ComponentsVariants["CcLocaleSelectorEntry"];
		};
		CcSignPad?: {
			defaultProps?: ComponentsPropsList["CcSignPad"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SignPadClassKey>;
			variants?: ComponentsVariants["CcSignPad"];
		};
		CcFormDialog?: {
			defaultProps?: ComponentsPropsList["CcFormDialog"];
			styleOverrides?: StyleOverridesWithoutOwnerState<FormDialogClassKey>;
			variants?: ComponentsVariants["CcFormDialog"];
		};
		CcPageTitle?: {
			defaultProps?: ComponentsPropsList["CcPageTitle"];
			styleOverrides?: StyleOverridesWithoutOwnerState<PageTitleClassKey>;
			variants?: ComponentsVariants["CcPageTitle"];
		};
		CcPopupMenu?: {
			defaultProps?: ComponentsPropsList["CcPopupMenu"];
			styleOverrides?: StyleOverridesWithoutOwnerState<PopupMenuClassKey>;
			variants?: ComponentsVariants["CcPopupMenu"];
		};
		CcFilesGrid?: {
			styleOverrides?: StyleOverridesWithoutOwnerState<FilesGridClassKey>;
		};
		CcPortalLayout?: {
			defaultProps?: ComponentsPropsList["CcPortalLayout"];
			styleOverrides?: ComponentsOverrides<Theme>["CcPortalLayout"];
			variants?: ComponentsVariants["CcPortalLayout"];
		};
		CcNotifications?: {
			defaultProps?: ComponentsPropsList["CcNotifications"];
			styleOverrides?: ComponentsOverrides<Theme>["CcNotifications"];
			variants?: ComponentsVariants["CcNotifications"];
		};
		CcToast?: {
			defaultProps?: ComponentsPropsList["CcToast"];
			styleOverrides?: ComponentsOverrides<Theme>["CcToast"];
			variants?: ComponentsVariants["CcToast"];
		};
		CcMultiSelectWithTags?: {
			defaultProps?: ComponentsPropsList["CcMultiSelectWithTags"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MultiSelectWithTagsClassKey>;
			variants?: ComponentsVariants["CcMultiSelectWithTags"];
		};
		CcMultiSelectWithoutGroup?: {
			defaultProps?: ComponentsPropsList["CcMultiSelectWithoutGroup"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MultiSelectWithoutGroupClassKey>;
			variants?: ComponentsVariants["CcMultiSelectWithoutGroup"];
		};
		CcDayContents?: {
			defaultProps?: ComponentsPropsList["CcDayContents"];
			styleOverrides?: ComponentsOverrides<Theme>["CcDayContents"];
			variants?: ComponentsVariants["CcDayContents"];
		};
		CcWeekViewDay?: {
			defaultProps?: ComponentsPropsList["CcWeekViewDay"];
			styleOverrides?: StyleOverridesWithoutOwnerState<WeekViewDayClassKey>;
			variants?: ComponentsVariants["CcWeekViewDay"];
		};
		CcScrollableSchedule?: {
			defaultProps?: ComponentsPropsList["CcScrollableSchedule"];
			styleOverrides?: StyleOverridesWithoutOwnerState<ScrollableScheduleClassKey>;
			variants?: ComponentsVariants["CcScrollableSchedule"];
		};
		CcScrollableScheduleDay?: {
			defaultProps?: ComponentsPropsList["CcScrollableScheduleDay"];
			styleOverrides?: StyleOverridesWithoutOwnerState<ScrollableScheduleDayClassKey>;
			variants?: ComponentsVariants["CcScrollableScheduleDay"];
		};
		CcWeekView?: {
			defaultProps?: ComponentsPropsList["CcWeekView"];
			styleOverrides?: StyleOverridesWithoutOwnerState<WeekViewClassKey>;
			variants?: ComponentsVariants["CcWeekView"];
		};
		CcDataGrid?: {
			defaultProps?: ComponentsPropsList["CcDataGrid"];
			styleOverrides?: StyleOverridesWithoutOwnerState<DataGridClassKey>;
			variants?: ComponentsVariants["CcDataGrid"];
		};
		CcGridMultiSelectFilter?: {
			defaultProps?: ComponentsPropsList["CcGridMultiSelectFilter"];
			styleOverrides?: StyleOverridesWithoutOwnerState<GridMultiSelectFilterClassKey>;
			variants?: ComponentsVariants["CcGridMultiSelectFilter"];
		};
		CcGridMultiSelectFilterBackend?: {
			defaultProps?: ComponentsPropsList["CcGridMultiSelectFilterBackend"];
			styleOverrides?: StyleOverridesWithoutOwnerState<GridMultiSelectFilterBackendClassKey>;
			variants?: ComponentsVariants["CcGridMultiSelectFilterBackend"];
		};
		CcGridSingleSelectFilter?: {
			defaultProps?: ComponentsPropsList["CcGridSingleSelectFilter"];
			styleOverrides?: StyleOverridesWithoutOwnerState<GridSingleSelectFilterClassKey>;
			variants?: ComponentsVariants["CcGridSingleSelectFilter"];
		};
		CcGridSingleSelectFilterBackend?: {
			defaultProps?: ComponentsPropsList["CcGridSingleSelectFilterBackend"];
			styleOverrides?: StyleOverridesWithoutOwnerState<GridSingleSelectFilterBackendClassKey>;
			variants?: ComponentsVariants["CcGridSingleSelectFilterBackend"];
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
