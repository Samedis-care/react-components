import {
	MenuItemProps as PortalMenuItemProps,
	PortalMenuClassKey,
	PortalMenuProps,
} from "./standalone/Portal/Menu";
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
			// the root gets every prop but className, classes, aria-label and
			// aria-labelledby
			variants?: VariantsWithoutOwnerState<
				Omit<
					LoaderProps,
					"className" | "classes" | "aria-label" | "aria-labelledby"
				>
			>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of MultiGrid's props.
		CcMultiGrid?: {
			defaultProps?: ComponentsPropsList["CcMultiGrid"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MultiGridClassKey>;
		};
		CcVerticalDivider?: {
			defaultProps?: ComponentsPropsList["CcVerticalDivider"];
			styleOverrides?: StyleOverridesWithoutOwnerState<VerticalDividerClassKey>;
			// the root gets every prop but className
			variants?: VariantsWithoutOwnerState<
				Omit<VerticalDividerProps, "className">
			>;
		};
		CcSmallIconButton?: {
			defaultProps?: ComponentsPropsList["CcSmallIconButton"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SmallIconButtonClassKey>;
			// the root gets every prop
			variants?: VariantsWithoutOwnerState<SmallIconButtonProps>;
		};
		CcSmallestIconButton?: {
			defaultProps?: ComponentsPropsList["CcSmallestIconButton"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SmallestIconButtonClassKey>;
			// the root gets every prop
			variants?: VariantsWithoutOwnerState<SmallestIconButtonProps>;
		};
		CcSmallListItem?: {
			defaultProps?: ComponentsPropsList["CcSmallListItem"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SmallListItemClassKey>;
			// the root gets every prop
			variants?: VariantsWithoutOwnerState<SmallListItemProps>;
		};
		CcSmallListItemButton?: {
			defaultProps?: ComponentsPropsList["CcSmallListItemButton"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SmallListItemButtonClassKey>;
			// the root gets every prop
			variants?: VariantsWithoutOwnerState<SmallListItemButtonProps>;
		};
		CcSelectorSmallListItem?: {
			defaultProps?: ComponentsPropsList["CcSelectorSmallListItem"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SelectorSmallListItemClassKey>;
			// the root gets every prop
			variants?: VariantsWithoutOwnerState<SelectorSmallListItemProps>;
		};
		CcSelectorSmallListItemButton?: {
			defaultProps?: ComponentsPropsList["CcSelectorSmallListItemButton"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SelectorSmallListItemButtonClassKey>;
			// the root gets every prop
			variants?: VariantsWithoutOwnerState<SelectorSmallListItemButtonProps>;
		};
		CcSmallListItemIcon?: {
			defaultProps?: ComponentsPropsList["CcSmallListItemIcon"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SmallListItemIconClassKey>;
			// the root gets every prop
			variants?: VariantsWithoutOwnerState<SmallListItemIconProps>;
		};
		CcCountryFlag?: {
			defaultProps?: ComponentsPropsList["CcCountryFlag"];
			styleOverrides?: StyleOverridesWithoutOwnerState<CountryFlagClassKey>;
			// the root gets every prop but className, classes and style
			variants?: VariantsWithoutOwnerState<
				Omit<CountryFlagProps, "className" | "classes" | "style">
			>;
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
		// No variants: MUI applies them to the root slot, and
		// DefaultFormPageButtons has none.
		CcDefaultFormPageButtons?: {
			defaultProps?: ComponentsPropsList["CcDefaultFormPageButtons"];
			styleOverrides?: StyleOverridesWithoutOwnerState<DefaultFormPageButtonsClassKey>;
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
			// the root gets every prop but children, className and classes
			variants?: VariantsWithoutOwnerState<
				Omit<GroupBoxProps, "children" | "className" | "classes">
			>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of MatrixGrid's props.
		CcMatrixGrid?: {
			defaultProps?: ComponentsPropsList["CcMatrixGrid"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MatrixGridClassKey>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of MatrixCellTile's props.
		CcMatrixCellTile?: {
			defaultProps?: ComponentsPropsList["CcMatrixCellTile"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MatrixCellTileClassKey>;
		};
		CcHowToBox?: {
			defaultProps?: ComponentsPropsList["CcHowToBox"];
			styleOverrides?: StyleOverridesWithoutOwnerState<HowToBoxClassKey>;
			variants?: VariantsWithoutOwnerState<
				Pick<HowToBoxProps, "titleLabel" | "labels">
			>;
		};
		// No variants: MUI matches them against the root's own props and
		// ownerState, which hold none of InfoBox's props. A theme reaches the
		// props through the state classes of the root and the header (see
		// InfoBoxClassKey).
		CcInfoBox?: {
			defaultProps?: ComponentsPropsList["CcInfoBox"];
			styleOverrides?: StyleOverridesWithoutOwnerState<InfoBoxClassKey>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of FormPageLayout's props.
		CcFormPageLayout?: {
			defaultProps?: ComponentsPropsList["CcFormPageLayout"];
			styleOverrides?: StyleOverridesWithoutOwnerState<FormPageLayoutClassKey>;
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
		// No variants: MUI matches them against the root's own props, which
		// hold none of ImageDots' props.
		CcImageDots?: {
			defaultProps?: ComponentsPropsList["CcImageDots"];
			styleOverrides?: StyleOverridesWithoutOwnerState<ImageDotsClassKey>;
		};
		CcImageBox?: {
			defaultProps?: ComponentsPropsList["CcImageBox"];
			styleOverrides?: ComponentsOverrides<Theme>["CcImageBox"];
			variants?: ComponentsVariants["CcImageBox"];
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of ImageDialogEntry's props.
		CcImageDialogEntry?: {
			defaultProps?: ComponentsPropsList["CcImageDialogEntry"];
			styleOverrides?: StyleOverridesWithoutOwnerState<ImageDialogEntryClassKey>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of CollapsibleMenu's props.
		CcCollapsibleMenu?: {
			defaultProps?: ComponentsPropsList["CcCollapsibleMenu"];
			styleOverrides?: StyleOverridesWithoutOwnerState<CollapsibleMenuClassKey>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of CenteredTypography's props.
		CcCenteredTypography?: {
			defaultProps?: ComponentsPropsList["CcCenteredTypography"];
			styleOverrides?: StyleOverridesWithoutOwnerState<CenteredTypographyClassKey>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of MultiImage's props.
		CcMultiImage?: {
			defaultProps?: ComponentsPropsList["CcMultiImage"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MultiImageClassKey>;
		};
		// No variants: MUI applies them to the root slot, and PortalLayoutMenu has
		// none.
		CcPortalLayoutMenu?: {
			defaultProps?: ComponentsPropsList["CcPortalLayoutMenu"];
			styleOverrides?: StyleOverridesWithoutOwnerState<PortalLayoutMenuClassKey>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of SignPadDialog's props.
		CcSignPadDialog?: {
			defaultProps?: ComponentsPropsList["CcSignPadDialog"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SignPadDialogClassKey>;
		};
		CcMenuItemJumboReactLight?: {
			defaultProps?: ComponentsPropsList["CcMenuItemJumboReactLight"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MenuItemJumboReactLightClassKey>;
			// the root gets the menu entry's onClick and onAuxClick, and none of
			// the other props
			variants?: VariantsWithoutOwnerState<
				Pick<PortalMenuItemProps, "onClick" | "onAuxClick">
			>;
		};
		CcMenuItemJumboReactDark?: {
			defaultProps?: ComponentsPropsList["CcMenuItemJumboReactDark"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MenuItemJumboReactDarkClassKey>;
			// the root gets the menu entry's onClick and onAuxClick, and none of
			// the other props
			variants?: VariantsWithoutOwnerState<
				Pick<PortalMenuItemProps, "onClick" | "onAuxClick">
			>;
		};
		// No variants: MUI applies them to the root slot, and File has none.
		CcFile?: {
			defaultProps?: ComponentsPropsList["CcFile"];
			styleOverrides?: StyleOverridesWithoutOwnerState<FileClassKey>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of DialogTitle's props.
		CcDialogTitle?: {
			defaultProps?: ComponentsPropsList["CcDialogTitle"];
			styleOverrides?: StyleOverridesWithoutOwnerState<DialogTitleClassKey>;
		};
		CcFileUpload?: {
			defaultProps?: ComponentsPropsList["CcFileUpload"];
			styleOverrides?: StyleOverridesWithoutOwnerState<FileUploadClassKey>;
			// the root gets smallLabel, and none of the other props
			variants?: VariantsWithoutOwnerState<Pick<FileUploadProps, "smallLabel">>;
		};
		// No variants: MUI applies them to the root slot, and CrudLoadStatus has
		// none.
		CcCrudLoadStatus?: {
			defaultProps?: ComponentsPropsList["CcCrudLoadStatus"];
			styleOverrides?: StyleOverridesWithoutOwnerState<CrudLoadStatusClassKey>;
		};
		// No variants: MUI applies them to the root slot, and ImageSelector has
		// none.
		CcImageSelector?: {
			defaultProps?: ComponentsPropsList["CcImageSelector"];
			styleOverrides?: StyleOverridesWithoutOwnerState<ImageSelectorClassKey>;
		};
		CcImagePreviewDialog?: {
			defaultProps?: ComponentsPropsList["CcImagePreviewDialog"];
			styleOverrides?: StyleOverridesWithoutOwnerState<ImagePreviewDialogClassKey>;
			// the root gets open and onClose, and none of the other props
			variants?: VariantsWithoutOwnerState<
				Pick<ImagePreviewDialogProps, "open" | "onClose">
			>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of PortalMenu's props.
		CcPortalMenu?: {
			defaultProps?: ComponentsPropsList["CcPortalMenu"];
			styleOverrides?: StyleOverridesWithoutOwnerState<PortalMenuClassKey>;
		};
		CcMenuItemMaterial?: {
			defaultProps?: ComponentsPropsList["CcMenuItemMaterial"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MenuItemMaterialClassKey>;
			// the root gets the menu entry's onClick and onAuxClick, and none of
			// the other props
			variants?: VariantsWithoutOwnerState<
				Pick<PortalMenuItemProps, "onClick" | "onAuxClick">
			>;
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
			// the root is the input, with every prop
			variants?: VariantsWithoutOwnerState<UiKitInputProps>;
		};
		CcUiKitInputOutlined?: {
			defaultProps?: ComponentsPropsList["CcUiKitInputOutlined"];
			styleOverrides?: StyleOverridesWithoutOwnerState<UiKitInputOutlinedClassKey>;
			// the root is the input, with every prop
			variants?: VariantsWithoutOwnerState<UiKitInputOutlinedProps>;
		};
		CcUiKitTextField?: {
			defaultProps?: ComponentsPropsList["CcUiKitTextField"];
			styleOverrides?: StyleOverridesWithoutOwnerState<UiKitTextFieldClassKey>;
			// the root is the text field, with every prop
			variants?: VariantsWithoutOwnerState<UiKitTextFieldProps>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of LocaleSelectorDialog's props.
		CcLocaleSelectorDialog?: {
			defaultProps?: ComponentsPropsList["CcLocaleSelectorDialog"];
			styleOverrides?: StyleOverridesWithoutOwnerState<LocaleSelectorDialogClassKey>;
		};
		// No variants: MUI applies them to the root slot, and
		// LocaleSelectorDialogContent has none.
		CcLocaleSelectorDialogContent?: {
			defaultProps?: ComponentsPropsList["CcLocaleSelectorDialogContent"];
			styleOverrides?: StyleOverridesWithoutOwnerState<LocaleSelectorDialogContentClassKey>;
		};
		CcLocaleSelectorEntry?: {
			defaultProps?: ComponentsPropsList["CcLocaleSelectorEntry"];
			styleOverrides?: StyleOverridesWithoutOwnerState<LocaleSelectorEntryClassKey>;
			// the root gets disabled and className, and none of the other props
			variants?: VariantsWithoutOwnerState<
				Pick<LocaleSelectorEntryProps, "disabled" | "className">
			>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of SignPad's props.
		CcSignPad?: {
			defaultProps?: ComponentsPropsList["CcSignPad"];
			styleOverrides?: StyleOverridesWithoutOwnerState<SignPadClassKey>;
		};
		// No variants: MUI applies them to the root slot, and FormDialog has none.
		CcFormDialog?: {
			defaultProps?: ComponentsPropsList["CcFormDialog"];
			styleOverrides?: StyleOverridesWithoutOwnerState<FormDialogClassKey>;
		};
		CcPageTitle?: {
			defaultProps?: ComponentsPropsList["CcPageTitle"];
			styleOverrides?: StyleOverridesWithoutOwnerState<PageTitleClassKey>;
			// the root gets every prop but disableAutoTitle
			variants?: VariantsWithoutOwnerState<
				Omit<PageTitleProps, "disableAutoTitle">
			>;
		};
		CcPopupMenu?: {
			defaultProps?: ComponentsPropsList["CcPopupMenu"];
			styleOverrides?: StyleOverridesWithoutOwnerState<PopupMenuClassKey>;
			// the root gets every prop but slotProps, which it extends
			variants?: VariantsWithoutOwnerState<Omit<PopupMenuProps, "slotProps">>;
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
		// No variants: MUI matches them against the root's own props, which
		// hold none of MultiSelectWithTags' props.
		CcMultiSelectWithTags?: {
			defaultProps?: ComponentsPropsList["CcMultiSelectWithTags"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MultiSelectWithTagsClassKey>;
		};
		// No variants: MUI applies them to the root slot, and
		// MultiSelectWithoutGroup has none.
		CcMultiSelectWithoutGroup?: {
			defaultProps?: ComponentsPropsList["CcMultiSelectWithoutGroup"];
			styleOverrides?: StyleOverridesWithoutOwnerState<MultiSelectWithoutGroupClassKey>;
		};
		CcDayContents?: {
			defaultProps?: ComponentsPropsList["CcDayContents"];
			styleOverrides?: ComponentsOverrides<Theme>["CcDayContents"];
			variants?: ComponentsVariants["CcDayContents"];
		};
		// No variants: MUI applies them to the root slot, and WeekViewDay has none.
		CcWeekViewDay?: {
			defaultProps?: ComponentsPropsList["CcWeekViewDay"];
			styleOverrides?: StyleOverridesWithoutOwnerState<WeekViewDayClassKey>;
		};
		// No variants: MUI applies them to the root slot, and ScrollableSchedule
		// has none.
		CcScrollableSchedule?: {
			defaultProps?: ComponentsPropsList["CcScrollableSchedule"];
			styleOverrides?: StyleOverridesWithoutOwnerState<ScrollableScheduleClassKey>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of ScrollableScheduleDay's props.
		CcScrollableScheduleDay?: {
			defaultProps?: ComponentsPropsList["CcScrollableScheduleDay"];
			styleOverrides?: StyleOverridesWithoutOwnerState<ScrollableScheduleDayClassKey>;
		};
		CcWeekView?: {
			defaultProps?: ComponentsPropsList["CcWeekView"];
			styleOverrides?: StyleOverridesWithoutOwnerState<WeekViewClassKey>;
			// the root gets className, and none of the other props
			variants?: VariantsWithoutOwnerState<Pick<WeekViewProps, "className">>;
		};
		// No variants: MUI matches them against the root's own props, which
		// hold none of DataGrid's props.
		CcDataGrid?: {
			defaultProps?: ComponentsPropsList["CcDataGrid"];
			styleOverrides?: StyleOverridesWithoutOwnerState<DataGridClassKey>;
		};
		// No variants: MUI applies them to the root slot, and GridMultiSelectFilter
		// has none.
		CcGridMultiSelectFilter?: {
			defaultProps?: ComponentsPropsList["CcGridMultiSelectFilter"];
			styleOverrides?: StyleOverridesWithoutOwnerState<GridMultiSelectFilterClassKey>;
		};
		// No variants: MUI applies them to the root slot, and
		// GridMultiSelectFilterBackend has none.
		CcGridMultiSelectFilterBackend?: {
			defaultProps?: ComponentsPropsList["CcGridMultiSelectFilterBackend"];
			styleOverrides?: StyleOverridesWithoutOwnerState<GridMultiSelectFilterBackendClassKey>;
		};
		// No variants: MUI applies them to the root slot, and
		// GridSingleSelectFilter has none.
		CcGridSingleSelectFilter?: {
			defaultProps?: ComponentsPropsList["CcGridSingleSelectFilter"];
			styleOverrides?: StyleOverridesWithoutOwnerState<GridSingleSelectFilterClassKey>;
		};
		// No variants: MUI applies them to the root slot, and
		// GridSingleSelectFilterBackend has none.
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
