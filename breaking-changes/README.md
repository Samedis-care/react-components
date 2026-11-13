# Breaking changes

Backward compatibility is **not** a requirement in this library — prefer the clean
API over a compatible one. In exchange, every breaking change gets recorded here so
the consuming apps know what to adjust when they bump.

One file per change, so this never grows into a single unreadable log.

## Conventions

- File name: `YYYY-MM-DD-<slug>.md`, using the date the change landed.
- Newest first in the index below.
- **Behavioral** changes count, not just type changes. Record it if consumers could
  be surprised: new UI rendered by default, a changed default value, or a prop that
  was previously ignored starting to take effect.
- Each entry states **what changed**, **why**, and the **migration** step — even if
  the migration is "nothing to do, but expect the new footer in screenshots".

## Index

| Date       | Change                                                                                                                         | Kind     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 2026-11-13 | [SignalPortlet shows no "Last refresh" label for 0 or an invalid time](2026-11-13-signal-portlet-no-label-without-time.md) | behavior |
| 2026-11-13 | [The date pickers report a blur when focus leaves the open calendar](2026-11-13-picker-blur-on-leaving-the-calendar.md) | behavior |
| 2026-11-13 | [Matrix columns are 56px wide by default, and the add chip is 24x24](2026-11-13-matrix-targets-24px.md) | behavior |
| 2026-11-13 | [A dimmed Matrix entry fades its fill only, and its label is picked for the faded fill](2026-11-13-matrix-dimmed-entry-fades-fill-only.md) | behavior |
| 2026-11-13 | [The touch Clear button is hidden while the input is read-only or disabled](2026-11-13-text-field-clear-hidden-while-read-only.md) | behavior |
| 2026-11-13 | [The Matrix add chip is named after its cell](2026-11-13-matrix-add-chip-names-its-cell.md) | behavior |
| 2026-11-13 | [A diagonal Matrix pair goes through renderItem, as its first entry](2026-11-13-matrix-diagonal-pair-goes-through-render-item.md) | behavior |
| 2026-11-13 | [A Matrix entry's tooltip is its accessible description](2026-11-13-matrix-entry-tooltip-is-its-description.md) | behavior |
| 2026-11-13 | [The touch Clear button follows what the field shows, and selectors only have their own](2026-11-13-text-field-clear-follows-shown-value.md) | behavior |
| 2026-11-13 | [A date picker says in text why it rejects a date](2026-11-13-date-picker-validation-message.md) | behavior |
| 2026-11-13 | [LocalizedDateTimePicker opens the mobile dialog below 600px](2026-11-13-date-time-picker-mobile-dialog-below-600px.md) | behavior |
| 2026-11-13 | [SignalPortlet's "Last refresh" age advances while the card is mounted](2026-11-13-signal-portlet-age-advances.md) | behavior |
| 2026-11-13 | [DialogTitle with noTitle renders no heading; an untitled FullFormDialog is named by aria-label](2026-11-13-dialog-title-no-title-no-heading.md) | behavior, type |
| 2026-11-13 | [IntegerInputField flags numbers it can't hold, and never shows exponent form](2026-11-13-integer-input-out-of-range.md) | behavior |
| 2026-11-13 | [DecimalInputField flags a separator without a digit instead of reporting NaN](2026-11-13-decimal-input-parse-error-message.md) | behavior |
| 2026-11-13 | [A dialog button's handler may navigate, and the confirm helpers settle once their dialog is closed](2026-11-13-dialog-button-handler-may-navigate.md) | behavior |
| 2026-11-13 | [Open dialogs no longer block navigation or closing the tab](2026-11-13-dialogs-no-longer-block-navigation.md) | behavior, i18n |
| 2026-11-13 | [A date picker keeps a rejected entry when focus leaves it](2026-11-13-picker-keeps-rejected-entry.md) | behavior |
| 2026-11-13 | [InputWithHelp and OutlinedInputWithHelp are removed](2026-11-13-input-with-help-removed.md) | type |
| 2026-11-13 | [A warning's underline is 1px at rest and 2px only while the field is focused](2026-11-13-warning-underline-drawn-like-error.md) | behavior |
| 2026-11-13 | [Filled toasts darken a fill until its text reaches 4.5:1](2026-11-13-toast-filled-fill-contrast.md) | behavior |
| 2026-11-13 | [A form page scrolls a focused field clear of its footer, and the footer stops floating on short screens](2026-11-13-form-page-layout-focus-clear-of-footer.md) | behavior |
| 2026-11-13 | [A form page's Save stays focusable while unavailable](2026-11-13-form-page-save-focusable-while-unavailable.md) | behavior |
| 2026-11-13 | [A Form given another record drops the previous page's validation and submit handlers](2026-11-13-form-record-switch-drops-handlers.md) | behavior |
| 2026-11-13 | [GroupBox's small legend is a state class, not an ownerState](2026-11-13-group-box-small-label-state-class.md) | type, theme |
| 2026-11-13 | [The Portal menu keeps keyboard focus when the focused entry is removed](2026-11-13-portal-menu-keeps-focus.md) | behavior |
| 2026-11-13 | [The locale selector's search box is named "Search", and a status announces its result](2026-11-13-locale-selector-search-named.md) | behavior |
| 2026-11-13 | [RoutedMenu highlights the most specific entry of the whole menu](2026-11-13-routed-menu-most-specific-match.md) | behavior |
| 2026-11-13 | [MultiGrid sets its header's overflow, and a scroll of the header moves the body](2026-11-13-multi-grid-header-scroll-moves-body.md) | behavior |
| 2026-11-13 | [FormCrudMultiSelect is read-only in a read-only form, and a save leaves it as it is](2026-11-13-form-crud-multi-select-read-only.md) | behavior |
| 2026-11-13 | [FormCrudMultiSelect is read-only in a read-only form, listing only its entries, and a save leaves it as it is](2026-11-13-form-crud-multi-select-read-only.md) | behavior, theme |
| 2026-11-13 | [The locale selector's rows draw a keyboard focus ring](2026-11-13-locale-selector-row-focus-ring.md) | behavior |
| 2026-11-13 | [InlineSwitch applies classes.switch](2026-11-13-inline-switch-classes-switch.md) | behavior |
| 2026-11-13 | [DataGridLocalStoragePersist mounts its children again when its storageKey changes](2026-11-13-data-grid-local-storage-persist-remounts-on-key-change.md) | behavior |
| 2026-11-13 | [BackendSingleSelect's switch comes with switchFilterName, which filters the options; displaySwitch is gone](2026-11-13-backend-single-select-switch-filter-name.md) | type |
| 2026-11-13 | [A data grid clamps stored column widths to the column's limits when it opens](2026-11-13-data-grid-stored-widths-clamped.md) | behavior |
| 2026-11-13 | [InfoBox's expanded is controlled, and defaultExpanded sets the initial state](2026-11-13-info-box-expanded-controlled.md) | API, type, behavior |
| 2026-11-13 | [MultiLanguageInput names every field with its language, inside a group named by the label](2026-11-13-multi-language-input-field-names.md) | behavior |
| 2026-11-13 | [The MUI checkbox renderer draws a keyboard focus ring](2026-11-13-checkbox-renderer-focus-ring.md) | behavior |
| 2026-11-13 | [A refused inline edit in BackendDataGrid shows an error dialog](2026-11-13-data-grid-refused-inline-edit-dialog.md) | behavior |
| 2026-11-13 | [An image's placeholder is announced as "No image present"](2026-11-13-image-placeholder-alt-no-image-present.md) | behavior |
| 2026-11-13 | [A files field in a grid cell takes one line: a link, or a count with a menu](2026-11-13-files-renderer-grid-cell-one-line.md) | behavior, theme |
| 2026-11-13 | [timestampToAge words the age with Intl.RelativeTimeFormat: grammatical in every language, with weeks to years and future times](2026-11-13-timestamp-to-age-intl.md) | behavior |
| 2026-11-13 | [The backend multi selects leave "Loading…" entries out of raw](2026-11-13-backend-multi-select-raw-without-loading-entries.md) | behavior |
| 2026-11-13 | [useNavigate and Link keep a navigation inside the app](2026-11-13-navigate-stays-in-app.md) | behavior |
| 2026-11-13 | [DateTimeInput passes on all of slotProps.textField.slotProps, and a function-form inputLabel is used on both date inputs](2026-11-13-date-time-input-text-field-slot-props.md) | behavior |
| 2026-11-13 | [ColorInput has a "Choose color" button, and its open picker is a dialog](2026-11-13-color-input-picker-button.md) | behavior |
| 2026-11-13 | [DateInput takes and gives every date as a date-only value](2026-11-13-date-input-date-only-date-props.md) | type, behavior |
| 2026-11-13 | [RoutedTabs draws a focus ring and turns the focus ripple off](2026-11-13-routed-tabs-focus-ring.md) | behavior, theme |
| 2026-11-12 | [The Loader's status text is a paragraph, not a heading](2026-11-12-loader-status-text-is-no-heading.md) | behavior |
| 2026-11-12 | [PopupMenu item labels wrap instead of being cut off](2026-11-12-popup-menu-labels-wrap.md) | behavior |
| 2026-11-12 | [CountryFlags, CountryCodes and CountryOption.value are typed by CountryCode, and CountryFlags is frozen](2026-11-12-country-flags-typed-by-country-code.md) | type, behavior |
| 2026-11-12 | [SmallIconButton is at least 24x24](2026-11-12-small-icon-button-minimum-target.md) | behavior |
| 2026-11-12 | [MobileScalingFix no longer restricts zoom on iPhone; text fields get at least 16px on iOS](2026-11-12-mobile-scaling-fix-ios-text-field-font-size.md) | behavior |
| 2026-11-12 | [A HowToBox skips entries that render nothing](2026-11-12-how-to-box-skips-empty-entries.md) | behavior |
| 2026-11-12 | [InfiniteScroll's scroll container is a tab stop and takes the props of a div](2026-11-12-infinite-scroll-tab-stop.md) | behavior |
| 2026-11-12 | [The busy overlay stays below dialogs, snackbars, tooltips and the app bar](2026-11-12-form-loader-overlay-below-app-layers.md) | behavior, theme |
| 2026-11-10 | [InfiniteScroll loads nothing while it is hidden, and fills once it is shown](2026-11-10-infinite-scroll-waits-while-hidden.md) | behavior |
| 2026-11-10 | [The Small list items narrow MUI's gutters, and MultiSelect's entries move 8px to the left](2026-11-10-small-list-item-gutters.md) | behavior |
| 2026-11-10 | [Country flags come from country-flag-icons: every flag is 3:2 and drawn for small sizes](2026-11-10-country-flags-from-country-flag-icons.md) | behavior |
| 2026-11-10 | [The Loader is a status region](2026-11-10-loader-status-region.md) | behavior |
| 2026-11-10 | [A form page's footer is sticky, and its busy overlay covers only the form](2026-11-10-form-page-layout-sticky-footer.md) | behavior, theme |
| 2026-11-10 | [MobileScalingFix puts the page's viewport back when it unmounts](2026-11-10-mobile-scaling-fix-restores-viewport-on-unmount.md) | behavior |
| 2026-11-10 | [A HowToBox with an empty labels array renders nothing](2026-11-10-how-to-box-hides-empty-array.md) | behavior |
| 2026-11-10 | [PopupMenu is flat by default](2026-11-10-popup-menu-flat-by-default.md) | behavior |
| 2026-11-10 | [useCountryOptions gives each country a CountryFlag as its icon](2026-11-10-country-options-icon-is-country-flag.md) | type, behavior |
| 2026-11-10 | [LocaleSelectorEntry shows its flag as a CountryFlag: the theme slot flag replaces imageWrapper and image](2026-11-10-locale-selector-entry-country-flag.md) | type, behavior |
| 2026-11-10 | [SmallestIconButton is at least 24x24](2026-11-10-smallest-icon-button-minimum-target.md) | behavior |
| 2026-11-10 | [The Loader's progressbar is named by its text, or "Loading…"](2026-11-10-loader-progressbar-named.md) | behavior |
| 2026-11-10 | [MobileScalingFix keeps the page's other viewport directives](2026-11-10-mobile-scaling-fix-keeps-viewport-directives.md) | behavior |
| 2026-11-10 | [CountryFlags has no prototype: names of Object.prototype are not flags](2026-11-10-country-flags-no-prototype.md) | behavior |
| 2026-11-10 | [The Loader passes className and HTML attributes on, so styled(Loader) and FormLoaderOverlay's loader override apply](2026-11-10-loader-passes-class-name-and-attributes.md) | behavior |
| 2026-11-10 | [A dirty form page still asks before it is left while it saves](2026-11-10-form-page-guarded-while-saving.md) | behavior |
| 2026-11-10 | [FilterIcon, SignIcon and ExportIcon take a caller's viewBox](2026-11-10-icons-take-a-callers-viewbox.md) | behavior |
| 2026-11-10 | [A line break in a HowToBox entry starts a new line](2026-11-10-how-to-box-line-breaks-in-entries.md) | behavior |
| 2026-11-10 | [InfiniteScroll calls the latest callbacks, and drops a bottom call the list no longer needs](2026-11-10-infinite-scroll-calls-latest-callbacks.md) | behavior |
| 2026-11-10 | [A record batched by enableRequestBatching is deserialized for edit](2026-11-10-model-batched-get-deserialized-for-edit.md) | behavior |
| 2026-11-10 | [FilterIcon, SignIcon and ExportIcon are padded like Material icons](2026-11-10-icons-padded-like-material-icons.md) | behavior |
| 2026-11-10 | [The Loader centers its text and spinner as one block](2026-11-10-loader-centers-text-and-spinner.md) | type, behavior |
| 2026-11-10 | [A data grid's stored sort is its whole sort; defaultSort only applies when nothing is stored](2026-11-10-data-grid-stored-sort-is-whole.md) | behavior, type |
| 2026-11-10 | [TuneIcon, ResetIcon, SuccessOutlinedIcon and AppsIcon are replaced by Material icons](2026-11-10-icons-retired-for-material-icons.md) | type, behavior |
| 2026-11-10 | [The DataGrid's column-header filter buttons show an outlined funnel, and a filled one while the column is filtered](2026-11-10-data-grid-column-filter-icons.md) | behavior, theme |
| 2026-11-06 | [A dialog button's onClick gets the dialog's close; the show…Dialog helpers return a closable promise](2026-11-06-dialog-button-onclick-gets-close.md) | type, behavior |
| 2026-11-06 | [The simple dialogs, SignDialog and LocaleSelectorDialog close only their own dialog](2026-11-06-simple-dialogs-close-themselves.md) | behavior |
| 2026-11-06 | [pushDialog returns a close for the dialog it pushed, and PushedDialogCloseContext is exported](2026-11-06-push-dialog-returns-close.md) | API, type |
| 2026-11-06 | [A lazy control's queue counts again when it mounts again, and flow forms save it](2026-11-06-lazy-crud-connector-unmounted-queue.md) | behavior |
| 2026-11-06 | [A multiline MultiLanguageInput switches its language with buttons below the field](2026-11-06-multi-language-input-language-buttons.md) | behavior, theme |
| 2026-11-06 | [FileUpload clears its file input after every pick](2026-11-06-file-upload-clears-input-after-pick.md) | behavior |
| 2026-11-06 | [ImageBox opens its full-screen view from a button, and MultiImage's dots are buttons](2026-11-06-multi-image-viewing-by-keyboard.md) | behavior, type |
| 2026-11-06 | [DecimalInputField shows its value in the current language and format](2026-11-06-decimal-input-follows-value-language-format.md) | behavior |
| 2026-11-06 | [The grid filter helpers take their default from defaultCustomData, and the Filter button follows the custom data](2026-11-06-custom-filters-button-follows-custom-data.md) | type, behavior |
| 2026-11-06 | [The column filter's AND/OR choice is a pair of toggle buttons](2026-11-06-data-grid-filter-and-or-toggle-buttons.md) | behavior |
| 2026-11-06 | [The number inputs keep a minus sign](2026-11-06-number-inputs-keep-minus-sign.md) | behavior |
| 2026-11-06 | [DataGrid's enum filter labels its checkboxes with their text](2026-11-06-data-grid-enum-filter-labelled-checkboxes.md) | behavior |
| 2026-11-06 | [A file's name is a link, or a button, that opens the file](2026-11-06-file-upload-files-open-by-keyboard.md) | behavior |
| 2026-11-06 | [The date pickers report a blur once focus leaves the field](2026-11-06-picker-blur-on-leaving-the-field.md) | behavior |
| 2026-11-06 | [Connect data shows a failed script check on its field, and says each check's result](2026-11-06-import-script-check-status.md) | behavior |
| 2026-11-06 | [The import upload names a file it cannot read, and drops it](2026-11-06-import-unreadable-file-dialog.md) | behavior |
| 2026-11-06 | [The import wizard writes the calendar day a date-only conversion names](2026-11-06-import-date-only-calendar-day.md) | behavior |
| 2026-11-06 | [A dirty form page asks before leaving for a path that only starts like its own](2026-11-06-form-page-guard-matches-route.md) | behavior |
| 2026-11-06 | [MultiSelectWithTags keeps focus in the group field while a group loads](2026-11-06-multi-select-with-tags-group-load-keeps-focus.md) | behavior |
| 2026-11-06 | [A selector's combobox and list are named by its label](2026-11-06-selector-named-by-its-label.md) | behavior |
| 2026-11-06 | [MultiSelect lists its entries in one list, and only an entry with onClick is a button](2026-11-06-multi-select-entries-one-list.md) | behavior |
| 2026-11-06 | [MultiSelectWithoutGroup's disabled disables its search field and its switch](2026-11-06-multi-select-without-group-disabled.md) | behavior |
| 2026-11-06 | [Link routes a click also when it has an onClick](2026-11-06-link-routes-with-on-click.md) | behavior |
| 2026-11-06 | [RoutedMenu fills route params from the whole menu, and hides and reports entries it cannot fill](2026-11-06-routed-menu-unresolved-route-params.md) | type, behavior |
| 2026-11-06 | [The column settings' search says that it searches the columns, and when nothing matches](2026-11-06-data-grid-column-search-says-so.md) | behavior |
| 2026-11-06 | [A keepMounted PopupMenu opens on its first item every time](2026-11-06-popup-menu-opens-on-first-item.md) | behavior |
| 2026-11-06 | [FullFormDialog closes only itself and calls onClose first; useCloseThisDialog closes the dialog a component is in](2026-11-06-full-form-dialog-closes-itself.md) | behavior |
| 2026-11-06 | [A disabled CrudMultiSelect takes no writes, also from its ref or an end adornment](2026-11-06-crud-select-disabled-takes-no-writes.md) | behavior, type |
| 2026-11-06 | [The DataGrid's empty and error messages are no longer headings, and are announced](2026-11-06-data-grid-empty-and-error-messages.md) | behavior |
| 2026-11-06 | [DataGrid row checkboxes are named after their row](2026-11-06-data-grid-row-checkboxes-named.md) | behavior, type |
| 2026-11-06 | [MultiGrid's header and pinned column leave room for the scrolling pane's scrollbars](2026-11-06-multi-grid-scrollbar-room.md) | behavior |
| 2026-11-06 | [Portal menu entries and buttons show a keyboard focus ring](2026-11-06-portal-focus-ring.md) | behavior |
| 2026-11-06 | [MultiImage's edit dialog has a row of buttons under each image, and ImageBox has no onRemove](2026-11-06-multi-image-edit-dialog-buttons.md) | type, behavior |
| 2026-11-06 | [InlineSwitch draws a focus ring](2026-11-06-inline-switch-focus-ring.md) | behavior |
| 2026-11-06 | [The empty modern image selector has an upload button](2026-11-06-image-selector-modern-upload-button.md) | behavior |
| 2026-11-06 | [FlowEngine moves the focus to a new stage, in a container of its own](2026-11-06-flow-engine-stage-focus.md) | behavior |
| 2026-11-06 | [Schedule entries wrap long words](2026-11-06-schedule-entries-wrap-long-words.md) | behavior |
| 2026-11-06 | [Matrix tile labels are black or white by contrast, for every fill](2026-11-06-matrix-tile-label-color.md) | behavior |
| 2026-11-06 | [FormCrudMultiSelect stays locked in a read-only Form, whatever disabled says](2026-11-06-form-crud-multi-select-read-only-wins.md) | behavior |
| 2026-11-06 | [CurrencyInput says in text why the amount is invalid](2026-11-06-currency-input-parse-error-message.md) | behavior |
| 2026-11-06 | [ObjectUrlLink links only http(s), blob and data URLs](2026-11-06-object-url-link-safe-schemes.md) | behavior |
| 2026-11-06 | [MultiLanguageInput follows its default language after mount](2026-11-06-multi-language-input-follows-default-language.md) | behavior |
| 2026-11-06 | [IntegerInputField ends the number at the decimal separator](2026-11-06-integer-input-ends-at-decimal-separator.md) | behavior |
| 2026-11-06 | [MatrixGrid tells renderRowHeader `touch` only while the header is the tap target](2026-11-06-matrix-row-header-touch-follows-tap-target.md) | behavior |
| 2026-11-06 | [PortalLayout's mobile drawer leaves a strip of backdrop on narrow screens](2026-11-06-portal-drawer-max-width.md) | behavior |
| 2026-11-06 | [buildDateColumns reads today and accent as date-only values](2026-11-06-build-date-columns-date-only-today.md) | behavior |
| 2026-11-06 | [Menu entries call onAuxClick for the middle button only](2026-11-06-menu-aux-click-middle-button-only.md) | behavior |
| 2026-11-06 | [ScrollableSchedule reloads its weeks when `loadWeekCallback` changes](2026-11-06-scrollable-schedule-reloads-on-new-callback.md) | behavior |
| 2026-11-06 | [Notifications: `refreshInterval` 0 switches polling off](2026-11-06-notifications-refresh-interval-off.md) | behavior |
| 2026-11-06 | [InfoBox's alwaysExpanded={false} lets the user open and close the box](2026-11-06-info-box-always-expanded-false.md) | behavior |
| 2026-11-06 | [The backend multi selects list additionalOptions ids from their entries](2026-11-06-multi-selects-list-additional-options.md) | behavior |
| 2026-11-06 | [BackendSingleSelect shows only the selected record](2026-11-06-backend-single-select-shows-only-the-selected-record.md) | behavior |
| 2026-11-06 | [A cancelled delete keeps the DataGrid's selection](2026-11-06-data-grid-cancelled-delete-keeps-selection.md) | type, behavior |
| 2026-11-06 | [MultiSelectWithTags is a group named by its title, and its group field has a name](2026-11-06-multi-select-with-tags-named-group.md) | behavior |
| 2026-11-06 | [Drop zones highlight only while files are dragged](2026-11-06-drop-zones-highlight-file-drags-only.md) | behavior |
| 2026-11-06 | [Each script field in Connect data is named after its field, and enum cards list their values](2026-11-06-import-script-field-names.md) | behavior |
| 2026-11-06 | [CRUD selects keep their field while the selection loads and after the load failed](2026-11-06-crud-select-keeps-field-while-loading.md) | behavior |
| 2026-11-06 | [SignalPortlet shows a count above 999 as "999+"](2026-11-06-signal-portlet-capped-count.md) | behavior |
| 2026-11-06 | [InfiniteScroll debounces loadMoreTop, and keeps debouncing callbacks passed after mount](2026-11-06-infinite-scroll-debounces-both-callbacks.md) | behavior |
| 2026-11-06 | [A pending auto-save is dropped when the form unmounts](2026-11-06-form-auto-save-dropped-on-unmount.md) | behavior, type |
| 2026-11-06 | [The default Back button is grey with dark text](2026-11-06-default-back-button-colors.md) | behavior |
| 2026-11-06 | [A field's message describes its control, and selectors show the error state](2026-11-06-form-field-message-describes-control.md) | behavior |
| 2026-11-06 | [ActionButton, SubActionButton and Checkbox draw a keyboard focus ring](2026-11-06-uikit-focus-ring.md) | behavior |
| 2026-11-06 | [FormButtons keys its slots by the buttons' keys and flattens nested arrays](2026-11-06-form-buttons-slot-keys.md) | behavior |
| 2026-11-06 | [Date and date-time fields show their message as the field's helper text](2026-11-06-date-fields-message-is-helper-text.md) | behavior |
| 2026-11-06 | [DialogTitle's heading holds only the title; the close button sits beside it](2026-11-06-dialog-title-heading.md) | behavior |
| 2026-11-06 | [The DataGrid query leaves out empty filter conditions](2026-11-06-data-grid-query-leaves-out-empty-conditions.md) | behavior |
| 2026-11-06 | [MatrixGrid's today and accent header labels are darkened to 4.5:1](2026-11-06-matrix-header-label-contrast.md) | behavior |
| 2026-11-06 | [RoutedTabs selects the default tab when no Tab has the URL's segment](2026-11-06-routed-tabs-default-tab-for-unknown-segment.md) | behavior |
| 2026-11-06 | [The Save buttons of DefaultFormPage and FlowEngine say why the form is read-only](2026-11-06-form-page-save-button-read-only-reasons.md) | behavior |
| 2026-11-06 | [BackendDataGridMultiSelect shows its label and the number of selected rows](2026-11-06-data-grid-multi-select-label-and-count.md) | behavior, type |
| 2026-11-06 | [GroupBox fills its parent's height only as the parent's only child](2026-11-06-group-box-fills-parent-only-as-only-child.md) | behavior |
| 2026-11-06 | [PopupMenu items and the Small icon buttons draw a focus ring](2026-11-06-focus-ring-popup-menu-small-icon-buttons.md) | behavior |
| 2026-11-06 | [The DataGrid's Delete stays focusable while unavailable](2026-11-06-data-grid-delete-focusable-while-unavailable.md) | behavior |
| 2026-11-06 | [CrudSelect lists a create that went through when deserialize fails on its response](2026-11-06-crud-select-lists-create-when-deserialize-fails.md) | behavior, type |
| 2026-11-06 | [The weekly schedule's settings menu lists every action](2026-11-06-weekly-schedule-menu-lists-every-action.md) | behavior |
| 2026-11-06 | [FormPageLayout's body is its own stacking context](2026-11-06-form-page-layout-body-stacking-context.md) | behavior |
| 2026-11-06 | [LocaleSelectorDialog keeps the current language when the picked one fails to load](2026-11-06-locale-selector-failed-load.md) | behavior |
| 2026-11-06 | [A data grid writes its persisted state when it changes, not when it opens](2026-11-06-data-grid-writes-persisted-state-on-change.md) | behavior |
| 2026-11-06 | [A Form given another record starts over](2026-11-06-form-record-switch-starts-over.md) | behavior |
| 2026-11-06 | [The multi selects sort a copy of the selection, and report it in the caller's order](2026-11-06-multi-select-sort-for-display-only.md) | behavior |
| 2026-11-06 | [The image preview dialog is named by its image's alt](2026-11-06-image-preview-dialog-named-by-alt.md) | behavior |
| 2026-11-06 | [LocaleSelectorDialog is full screen on phones, and its names wrap](2026-11-06-locale-selector-reflows.md) | behavior |
| 2026-11-05 | [FilterActiveIcon is removed](2026-11-05-filter-active-icon-removed.md) | type |
| 2026-11-05 | [The signature tile is a button](2026-11-05-sign-pad-tile-is-a-button.md) | behavior |
| 2026-11-05 | [The modern file upload has an upload button](2026-11-05-file-upload-modern-upload-button.md) | behavior |
| 2026-11-05 | [A field disabled by a visibility callback keeps its value](2026-11-05-value-dependent-visibility-keeps-value.md) | behavior |
| 2026-11-05 | [LazyConnector writes a record updated twice before the save](2026-11-05-lazy-connector-repeated-update.md) | behavior |
| 2026-11-05 | [File links open only http(s), blob and data URLs, in a tab without access to the app](2026-11-05-file-links-open-safely.md) | behavior |
| 2026-11-05 | [DecimalInputField commits only an edit, and calls onBlur](2026-11-05-decimal-input-commits-edits-only.md) | behavior |
| 2026-11-05 | [Warning labels and helper texts are darkened to a readable contrast](2026-11-05-warning-text-contrast.md) | behavior |
| 2026-11-05 | [MultiLanguageInput shows only `values`: a language without a value is an empty field](2026-11-05-multi-language-input-controlled.md) | behavior |
| 2026-11-05 | [The Loader takes up the height of its content in a parent of automatic height](2026-11-05-loader-reserves-its-height.md) | behavior |
| 2026-11-05 | [A controlled DataGrid selection survives reloads](2026-11-05-data-grid-controlled-selection-survives-reloads.md) | behavior |
| 2026-11-05 | [A freeSolo selector keeps its selection when the field is left](2026-11-05-free-solo-selector-keeps-selection-on-blur.md) | behavior |
| 2026-11-05 | [getNumberSeparator finds the group separator in every locale](2026-11-05-number-group-separator-every-locale.md) | behavior |
| 2026-11-05 | [The icons are typed as Material icons](2026-11-05-icons-svg-icon-component.md) | type |
| 2026-11-05 | [The Loader's outer slot is `root`, and theme variants apply to it](2026-11-05-loader-root-slot.md) | type, behavior |
| 2026-11-05 | [AppsIcon shows both rows of squares, centered](2026-11-05-apps-icon-viewbox.md) | behavior |
| 2026-11-05 | [SignIcon passes a fill prop through and sets no fill of its own](2026-11-05-sign-icon-fill.md) | behavior |
| 2026-11-05 | [The icons forward refs on React 18](2026-11-05-icons-forward-refs.md) | behavior |
| 2026-11-02 | [CrudFileUpload's additionalFiles no longer count toward its limits](2026-11-02-crud-file-upload-extras-outside-limits.md) | behavior |
| 2026-11-02 | [CrudFileUpload no longer takes defaultFiles and onRestoreFile](2026-11-02-crud-file-upload-drops-no-op-props.md) | type |
| 2026-10-30 | [CrudMultiImage keeps its field while additional images reload](2026-10-30-crud-multi-image-keeps-field-on-reload.md) | behavior |
| 2026-10-30 | [GroupBox takes any fieldset attribute; FileUpload and MultiImage pass them on through slotProps](2026-10-30-group-box-html-attributes.md) | type |
| 2026-10-30 | [CRUD controls report failed writes as a PartialApplyError; the file controls name each file](2026-10-30-partial-apply-error.md) | type, behavior |
| 2026-10-29 | [CrudMultiImage shows a write error in the edit dialog while that is open](2026-10-29-crud-multi-image-error-in-edit-dialog.md) | behavior |
| 2026-10-29 | [Backend selectors keep one search debounce while mounted](2026-10-29-backend-select-one-search-debounce.md)                  | behavior |
| 2026-10-29 | [Backend selectors label a selected record that fails to load with a translated text](2026-10-29-backend-select-load-error-labels.md) | behavior |
| 2026-10-28 | [CrudFileUpload and CrudMultiImage keep their field while loading and after a failed load](2026-10-28-crud-upload-load-states-keep-field.md) | behavior |
| 2026-10-28 | [CrudFileUpload and CrudMultiImage call onChange only when their list changes](2026-10-28-crud-upload-onchange-only-on-list-changes.md) | behavior |
| 2026-10-28 | [CrudFileUpload and CrudMultiImage keep the first connector, also for writes](2026-10-28-crud-upload-reads-connector-once.md) | behavior |
| 2026-10-27 | [Connector.deleteMultiple reports which records it could not delete](2026-10-27-delete-multiple-reports-failed-ids.md) | behavior, type |
| 2026-10-27 | [CrudFileUpload reports a queued removal with `delete: true`](2026-10-27-crud-file-upload-queued-removal-keeps-delete.md) | behavior |
| 2026-10-26 | [DataGrid shows select all in the selection column header too](2026-10-26-data-grid-select-all-in-column-header.md) | behavior |
| 2026-10-26 | [componentsCareBrowserTracingIntegration is imported from components-care/dist/sentry](2026-10-26-sentry-integration-own-entry-point.md) | type |
| 2026-10-26 | [Sentry 11 is required](2026-10-26-sentry-11-required.md) | type, behavior |
| 2026-10-26 | [Routes name spans after the deepest matched route, on every location](2026-10-26-routes-name-spans-after-deepest-route.md) | behavior, type |
| 2026-10-26 | [Locale and currency data come from CLDR 49](2026-10-26-locale-data-cldr-49.md) | behavior |
| 2026-10-15 | [Localized numbers take either . or , as decimal separator](2026-10-15-localized-numbers-take-either-decimal-separator.md) | behavior |
| 2026-10-15 | [getNumberSeparator finds the decimal separator with any format options](2026-10-15-number-separators-with-any-options.md) | behavior |
| 2026-10-15 | [Decimal and currency inputs open a keypad with a decimal separator](2026-10-15-decimal-inputs-decimal-keypad.md) | behavior |
| 2026-10-14 | [objectToDots keeps null, arrays and empty objects as values](2026-10-14-object-to-dots-keeps-leaves.md) | behavior |
| 2026-10-14 | [CrudFileUpload only creates files, and serialize takes no id](2026-10-14-crud-file-upload-creates-only.md) | behavior, type |
| 2026-10-14 | [Replacing a file by name removes the old one like the remove button](2026-10-14-file-upload-replacing-removes-old-file.md) | behavior |
| 2026-10-14 | [A nested form with disableNestedSubmit doesn't make its parent dirty](2026-10-14-nested-form-without-submit-not-dirty.md) | behavior |
| 2026-10-14 | [Form reads initialRecord when the record loads](2026-10-14-form-initial-record-read-on-load.md) | behavior |
| 2026-10-13 | [DataGrid overrides are not persisted](2026-10-13-data-grid-overrides-not-persisted.md) | behavior, type |
| 2026-10-13 | [semaphoreExec returns executor errors instead of rejecting](2026-10-13-semaphore-exec-returns-errors.md) | behavior |
| 2026-10-13 | [DataGrid persistence provides the latest state](2026-10-13-data-grid-persist-provides-latest-state.md) | behavior |
| 2026-10-13 | [The checkbox box reaches 3:1](2026-10-13-checkbox-box-reaches-3-to-1.md) | behavior |
| 2026-10-12 | [Enum types are typed by their values](2026-10-12-enum-types-generic.md) | type, behavior |
| 2026-10-12 | [Signature values can be null](2026-10-12-signature-values-nullable.md) | type |
| 2026-10-02 | [Models are typed by their fields](2026-10-02-models-typed-by-their-fields.md) | type |
| 2026-10-02 | [Connectors have no type parameters](2026-10-02-connectors-not-generic.md) | type |
| 2026-10-02 | [The form is typed by its model](2026-10-02-form-typed-by-model.md) | type |
| 2026-10-02 | [Selectors, DataGrid and CRUD are typed by their model](2026-10-02-model-components-typed-by-model.md) | type |
| 2026-10-01 | [File download links take Blobs](2026-10-01-file-download-links-take-blobs.md) | type |
| 2026-09-30 | [Connectors get a copy of the index params](2026-09-30-index-params-reach-connectors-as-a-copy.md) | behavior |
| 2026-09-29 | [DataGrid select all selects everything or nothing](2026-09-29-data-grid-select-all-is-all-or-nothing.md) | behavior |
| 2026-09-29 | [Model cacheOptions: cacheTime is gcTime](2026-09-29-cache-options-gc-time.md) | type |
| 2026-09-29 | [FormField can start the form in a field](2026-09-29-form-field-auto-focus.md) | type, behavior |
| 2026-09-29 | [useLocalStorageState follows what localStorage holds](2026-09-29-local-storage-state-follows-storage.md) | behavior |
| 2026-09-29 | [React 18 or 19 is required](2026-09-29-react-18-required.md) | type |
| 2026-09-29 | [DataGrid select all works without delete all](2026-09-29-data-grid-select-all.md) | behavior, type |
| 2026-09-29 | [The image viewers rotate](2026-09-29-image-viewers-rotate.md) | behavior |
| 2026-09-28 | [Picked images stay files instead of becoming data URIs](2026-09-28-picked-images-are-blobs.md) | type, behavior |
| 2026-09-28 | [postEditCallback takes and returns a Blob](2026-09-28-post-edit-callback-takes-blobs.md) | type |
| 2026-09-28 | [TypeFiles serializes the file itself](2026-09-28-type-files-serializes-files.md) | type, behavior |
| 2026-09-28 | [The API clients send Blobs](2026-09-28-api-clients-send-blobs.md) | behavior, type |
| 2026-09-28 | [Form values compare files by identity](2026-09-28-form-values-compare-files-by-identity.md) | behavior |
| 2026-09-28 | [Down-scaling without keeping the ratio no longer stretches the height](2026-09-28-downscale-without-ratio-keeps-height.md) | behavior |
| 2026-09-25 | [An LRU with nothing to show no longer hides a selector's options](2026-09-25-selector-lru-falls-back-when-nothing-resolves.md) | behavior |
| 2026-09-23 | [CrudSelect keeps what went through when part of a change fails](2026-09-23-crud-select-keeps-what-went-through.md) | behavior, type |
| 2026-09-21 | [MultiImage's edit label no longer navigates](2026-09-21-multi-image-edit-does-not-navigate.md) | behavior |
| 2026-09-21 | [Multi selects honor filterIds and refreshToken](2026-09-21-multi-select-honors-filter-ids.md) | behavior |
| 2026-09-17 | [A refused write no longer takes the ones beside it](2026-09-17-refused-writes-keep-what-went-through.md) | behavior |
| 2026-09-16 | [CrudFileUpload keeps additional files out of its own](2026-09-16-additional-files-stay-read-only.md) | behavior |
| 2026-09-16 | [DataGrid takes a ref and updates single rows through it](2026-09-16-data-grid-imperative-handle.md) | behavior, type |
| 2026-09-14 | [Queued deletes stay deleted, and pending file changes survive a remount](2026-09-14-queued-deletes-stay-deleted.md) | behavior |
| 2026-09-10 | [TreeView renders a forest, and hands renderers its connector lanes](2026-09-10-tree-view-forest.md) | behavior, type |
| 2026-09-03 | [DateTimeInput's required, error, fullWidth and onBlur reach the field](2026-09-03-date-time-input-forwards-field-props.md) | behavior |
| 2026-09-02 | [withMuiFieldState forwards refs](2026-09-02-mui-field-state-forwards-refs.md) | behavior |
| 2026-09-01 | [The form engine announces dirty state changes as events](2026-09-01-form-dirty-events.md) | behavior, type |
| 2026-08-31 | [withMuiWarning is now withMuiFieldState](2026-08-31-mui-warning-renamed-field-state.md) | type |
| 2026-08-31 | [File uploads show which files were added and removed](2026-08-31-file-upload-pending-changes.md) | behavior |
| 2026-08-31 | [Checkboxes, switches and radio groups mark their field touched on blur](2026-08-31-boolean-radio-blur-marks-touched.md) | behavior |
| 2026-08-31 | [Form fields can display their dirty state](2026-08-31-form-field-dirty-state.md)                                                | type     |
| 2026-08-26 | [New data grid columns use their column definition defaults](2026-08-26-data-grid-new-columns-use-defaults.md)                  | behavior |
| 2026-08-25 | [The data grid's scrolling pane is a tab stop](2026-08-25-data-grid-keyboard-scrollable.md)                                    | behavior |
| 2026-08-19 | [debouncePromise resolves each caller with its own invocation's result](2026-08-19-debounce-promise-per-invocation-results.md) | behavior |
| 2026-08-19 | [Multi select keeps the search query while selecting](2026-08-19-multi-select-keeps-search.md)                                 | behavior |
| 2026-08-18 | [additionalOptions moved out of the load path](2026-08-18-additional-options-outside-load-path.md)                             | behavior |
| 2026-08-18 | [Selector load handlers must return a load result object](2026-08-18-selector-load-handler-contract.md)                        | type     |
| 2026-08-18 | [Backend selectors show a truncation notice by default](2026-08-18-selector-truncation-notice.md)                              | behavior |
| 2026-08-18 | [MultiSelectWithTags now honors forceQuery](2026-08-18-multi-select-with-tags-force-query.md)                                  | behavior |
| 2026-08-18 | ["Start typing to search" is gated on forceQuery, not on lru](2026-08-18-selector-start-typing-text-gating.md)                 | behavior |
