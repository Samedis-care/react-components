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
| 2026-11-26 | [A HistoryRouter inside another one leaves the page's scroll position and focus alone](2026-11-26-nested-history-router-keeps-page-scroll-and-focus.md) | behavior |
| 2026-11-26 | [isPlainObject tells a plain object by its prototype; a record with an entry named constructor counts](2026-11-26-is-plain-object-by-prototype.md) | behavior |
| 2026-11-26 | [A long InlineSwitch label wraps beside the switch, and the switch stays on screen](2026-11-26-inline-switch-long-label-wraps.md) | behavior |
| 2026-11-26 | [On the page of a hidden entry, RoutedMenu highlights the closest shown entry](2026-11-26-routed-menu-hidden-entries-rank-last.md) | behavior |
| 2026-11-26 | [A lazy control of a new record no longer reports the parent id "null"](2026-11-26-lazy-crud-connector-parent-id-not-null.md) | behavior |
| 2026-11-26 | [useLazyCrudConnector's extraParams are a record](2026-11-26-lazy-crud-connector-extra-params-record.md) | type |
| 2026-11-26 | [A GroupBox's title breaks long words](2026-11-26-group-box-legend-breaks-long-words.md) | behavior |
| 2026-11-26 | [A GroupBox's width and height include its padding and border](2026-11-26-group-box-border-box.md) | behavior |
| 2026-11-26 | [A GroupBox in a parent with a max-height encloses its content](2026-11-26-group-box-encloses-content-in-max-height-parent.md) | behavior |
| 2026-11-26 | [A PartialDeleteError is named CcPartialDeleteError, and the default error-reporting policy judges it by its cause](2026-11-26-partial-delete-error-name-and-reporting.md) | behavior |
| 2026-11-26 | [An id dropped by onLoadError is not shown, also while the selection keeps it](2026-11-26-backend-select-dropped-id-not-shown.md) | behavior |
| 2026-11-26 | [A selected record that fails to load marks its field as erroneous](2026-11-26-backend-select-load-error-marks-field.md) | behavior |
| 2026-11-26 | [The default tab of RoutedTabs opens the route's own url, without a trailing "/"](2026-11-26-routed-tabs-default-tab-url-without-trailing-slash.md) | behavior |
| 2026-11-26 | [A RoutedMenu group only shows and hides its entries; its route is ignored](2026-11-26-routed-menu-group-ignores-route.md) | behavior |
| 2026-11-26 | [InlineSwitch's colors reach 3:1 and follow the theme's color scheme](2026-11-26-inline-switch-colors-reach-3-to-1.md) | behavior |
| 2026-11-26 | [The locale selector's list is a listbox: one tab stop, and the arrow, page, Home and End keys move between its rows](2026-11-26-locale-selector-list-is-a-listbox.md) | behavior, theme, type |
| 2026-11-26 | [An empty navigation target keeps the current path](2026-11-26-empty-navigation-target-keeps-current-path.md) | behavior |
| 2026-11-26 | [A data grid's stored column filters are its whole column filters; defaultFilter only applies when nothing is stored](2026-11-26-data-grid-stored-filters-are-whole.md) | behavior, type |
| 2026-11-26 | [A selector's switch is described by the selector's label](2026-11-26-selector-switch-described-by-label.md) | behavior |
| 2026-11-26 | [A HistoryRouter inside another one reports nothing to Sentry](2026-11-26-nested-history-router-not-reported-to-sentry.md) | behavior |
| 2026-11-26 | [CachedServerStorageProvider answers a fresh cached value synchronously](2026-11-26-cached-server-storage-answers-fresh-values-at-once.md) | type, behavior |
| 2026-11-26 | [A navigation to a hash scrolls to the element with that id and focuses it](2026-11-26-hash-navigation-scrolls-to-its-element.md) | behavior |
| 2026-11-26 | [The delete confirmation counts with plural forms](2026-11-26-data-grid-delete-confirmation-plurals.md) | behavior, i18n |
| 2026-11-26 | [The remaining CC theme entries offer the ownerState and variants their slots receive](2026-11-26-theme-owner-state-remaining-components.md) | type, theme |
| 2026-11-26 | [A theme styles InfoBox's status through classes, not ownerState or variants](2026-11-26-info-box-state-classes.md) | type, theme |
| 2026-11-26 | [A selected initialData record whose conversion fails is listed as a failed load](2026-11-26-backend-multi-select-initial-data-conversion-error.md) | behavior |
| 2026-11-26 | [The date pickers call `onAccept` with the dates they report to `onChange`](2026-11-26-picker-on-accept-when-done.md) | behavior |
| 2026-11-26 | [A date-time picker says in text why it rejects a date and time](2026-11-26-date-time-picker-validation-message.md) | behavior, i18n |
| 2026-11-26 | [Theme variants of most CC components get no ownerState, and match only what their root receives](2026-11-26-theme-variants-without-owner-state.md) | type, theme |
| 2026-11-26 | [BackendSingleSelect shows a picked record as picked, without looking it up](2026-11-26-backend-single-select-pick-not-looked-up.md) | behavior |
| 2026-11-26 | [Model.index2 reports an unexpected error, as index does](2026-11-26-model-index2-reports-errors.md) | behavior |
| 2026-11-26 | [The busy overlay's focus ring shows at once; what fades in is the wash's color and its spinner](2026-11-26-form-loader-overlay-focus-ring-at-once.md) | behavior, theme |
| 2026-11-26 | [Tab switches keep the scroll position, and PortalLayout's main pane scrolls to the top after a navigation](2026-11-26-scroll-reset-tabs-and-scroll-containers.md) | behavior |
| 2026-11-26 | [The default error-reporting policy judges a PartialApplyError by the errors it wraps](2026-11-26-partial-apply-error-reporting.md) | behavior |
| 2026-11-26 | [Hiding a selector's switch turns it off, and showing it starts it at defaultSwitchValue](2026-11-26-selector-hidden-switch-turns-off.md) | behavior |
| 2026-11-26 | [The locale selector's picked row keeps its element, focus and tab stop while the language loads](2026-11-26-locale-selector-picked-row-keeps-focus.md) | behavior |
| 2026-11-26 | [A GroupBox label of `0` is its legend, and `label={true}` draws none](2026-11-26-group-box-zero-label-is-the-legend.md) | behavior |
| 2026-11-26 | [Routes renders the most specific matching route, `""` and `"/"` match only the parent's url, and Route takes `end`](2026-11-26-routes-rank-by-specificity.md) | behavior, type |
| 2026-11-26 | [InfiniteScroll loads more when focus reaches its last row](2026-11-26-infinite-scroll-loads-on-focus-of-last-row.md) | behavior |
| 2026-11-26 | [HowToBox shows its default title only for an omitted `titleLabel`; `null` and `""` show no title](2026-11-26-how-to-box-null-hides-title.md) | behavior, type |
| 2026-11-26 | [InfiniteScroll fills its container again when it grows, and `dynamicallySized` is removed](2026-11-26-infinite-scroll-observes-its-size.md) | behavior, type |
| 2026-11-26 | [HowToBox takes any fieldset attribute, `sx` and `ref`, and its list gets an id from `id`](2026-11-26-how-to-box-html-attributes.md) | behavior, type |
| 2026-11-26 | [A grid leaves the stored parts its `persist` leaves out as they are](2026-11-26-data-grid-persist-keeps-left-out-parts.md) | behavior |
| 2026-11-26 | [A persistence provider gets the JSON form of a grid's state](2026-11-26-data-grid-persist-json-form.md) | behavior |
| 2026-11-26 | [A Form's save names the files and images the backend refused](2026-11-26-file-controls-name-refused-queued-writes.md) | behavior |
| 2026-11-26 | [The busy overlay's shown state is a class, and the form layout takes its colors, timing and offsets from the theme](2026-11-26-form-layout-theme-values.md) | type, behavior, theme |
| 2026-11-26 | [Routes takes any JSX children, and a key on a child takes effect](2026-11-26-routes-children-and-keys.md) | behavior, type |
| 2026-11-26 | [A nested form in a flow stage that was left keeps its edits for the flow's save; a stage change that only stages sends nothing](2026-11-26-flow-form-nested-form-staged.md) | behavior, type |
| 2026-11-26 | [Pushed dialogs close when a navigation leads to another path](2026-11-26-dialogs-close-on-navigation.md) | behavior |
| 2026-11-26 | [The icon of a small ActionButton is centred](2026-11-26-small-action-button-icon-centred.md) | behavior |
| 2026-11-26 | [The busy overlay fades in late on every show, also when it is mounted shown](2026-11-26-form-loader-overlay-every-show-fades-in-late.md) | behavior |
| 2026-11-26 | [InfiniteScroll loads before the bottom, and holds its calls while `loading` is set](2026-11-26-infinite-scroll-loading-and-threshold.md) | behavior |
| 2026-11-26 | [A HistoryRouter inside a Route starts a fresh routing scope: its routes resolve from "/"](2026-11-26-history-router-fresh-routing-scope.md) | behavior |
| 2026-11-26 | [The persistence providers hold back and mount again only their grids](2026-11-26-data-grid-persist-holds-back-only-the-grids.md) | behavior |
| 2026-11-26 | [A refused write no longer stops a LazyConnector's queue, and the error names what was refused](2026-11-26-lazy-connector-sends-past-refused-writes.md) | behavior, type |
| 2026-11-26 | [The locale selector opens at the row of the current locale](2026-11-26-locale-selector-opens-at-current-locale.md) | behavior |
| 2026-11-26 | [MultiSelectWithoutGroup's switch has a row of its own above the chips, at the right end, with its label before it](2026-11-26-multi-select-without-group-switch-row.md) | behavior |
| 2026-11-25 | [A routed menu entry opens a new tab at the URL a click navigates to](2026-11-25-routed-menu-new-tab-opens-history-href.md) | behavior |
| 2026-11-25 | [On phones the DataGrid moves header and footer buttons into their menus, so both fit 320px](2026-11-25-data-grid-phone-header-footer-fit.md) | behavior |
| 2026-11-25 | [HowToBox entries break long words](2026-11-25-how-to-box-breaks-long-words.md) | behavior |
| 2026-11-25 | [A small ActionButton or SubActionButton is named by its label in every state](2026-11-25-small-action-button-named-by-label.md) | behavior |
| 2026-11-25 | [InlineSwitch's slots have static `CcInlineSwitch-*` classes, which rules for those classes now match](2026-11-25-inline-switch-static-slot-classes.md) | behavior |
| 2026-11-25 | [showErrorDialog lists the messages of a ValidationError only](2026-11-25-show-error-dialog-lists-validation-errors-only.md) | behavior |
| 2026-11-25 | [The DataGrid no longer takes `enableFilterDialogMediaQuery`](2026-11-25-data-grid-filter-dialog-media-query-removed.md) | type, behavior |
| 2026-11-25 | [After the last file, focus steps back to the previous file's button; custom variants get the focus handling from useFileActionButtonFocus](2026-11-25-file-upload-focus-after-last-file.md) | behavior |
| 2026-11-25 | [DialogTitle: the action and the close button sit in a new box, and an action that doesn't fit moves below the title](2026-11-25-dialog-title-controls-box.md) | behavior |
| 2026-11-24 | [A FullFormDialog title that shows after loading takes the focus](2026-11-24-full-form-dialog-late-title-takes-focus.md) | behavior |
| 2026-11-24 | [A flow form has a second dirty flag, stagedDirty, for staged edits](2026-11-24-flow-form-staged-dirty.md) | behavior, type |
| 2026-11-24 | [PortalLayout's mobile drawer has a close button for screen readers and keyboard users](2026-11-24-portal-drawer-close-button.md) | behavior |
| 2026-11-24 | [An image field's placeholder is no longer its value: assistive technology skips it, and a click opens the file dialog](2026-11-24-image-placeholder-not-the-value.md) | behavior |
| 2026-11-24 | [The DataGrid's filter panel has a row count, Reset and "Show results", and shows the bar's selects on a phone](2026-11-24-data-grid-filter-panel-footer-and-phone-selects.md) | behavior |
| 2026-11-24 | [The DataGrid's filter panel button is named "Filter selection" and says whether the panel is open](2026-11-24-data-grid-filter-panel-button-name.md) | behavior, i18n |
| 2026-11-24 | [The date pickers report a date once the user is done with it](2026-11-24-pickers-report-when-done.md) | behavior |
| 2026-11-21 | [The date pickers report a blur when focus leaves a calendar opened from outside the field](2026-11-21-picker-blur-on-leaving-a-calendar-opened-from-outside.md) | behavior |
| 2026-11-21 | [The page scrolls to the top after a navigation, not before](2026-11-21-scroll-reset-after-navigation.md) | behavior |
| 2026-11-21 | [UIKit theme types match what the slots get, and button variants apply](2026-11-21-ui-kit-theme-owner-state-and-variants.md) | behavior, type, theme |
| 2026-11-21 | [MultiImage shows "2 / 30" instead of dots that do not fit in one row](2026-11-21-image-dots-counter-when-they-do-not-fit.md) | behavior, theme |
| 2026-11-21 | [filterSortPaginate ends a filter chain at its first condition without a value](2026-11-21-filter-sort-paginate-ends-chain-at-empty-condition.md) | behavior |
| 2026-11-21 | [The DataGrid footer formats its row counts for the language](2026-11-21-data-grid-row-counts-formatted.md) | behavior |
| 2026-11-21 | [A hovered small SubActionButton paints its icon in the hover's text color](2026-11-21-small-sub-action-button-hover-icon-color.md) | behavior |
| 2026-11-21 | [The text and date fields no longer take `important`](2026-11-21-text-field-important-removed.md) | type |
| 2026-11-21 | [GenericDataPreview shows the rows of new data](2026-11-21-generic-data-preview-reloads-new-data.md) | behavior |
| 2026-11-21 | [useFormState restores a stored null and follows a changed name](2026-11-21-use-form-state-restores-null.md) | behavior, type |
| 2026-11-21 | [MultiImage's edit dialog tells the primary image apart by star shape and text](2026-11-21-multi-image-primary-told-apart.md) | behavior, theme |
| 2026-11-21 | [compareArrayContent counts falsy entries and duplicates](2026-11-21-compare-array-content-counts-entries.md) | behavior |
| 2026-11-21 | [MatrixGrid is a grid with rows, header cells and cells for assistive technology](2026-11-21-matrix-grid-semantics.md) | behavior |
| 2026-11-21 | [MultiSelect's remove and restore handlers are bound to their entry](2026-11-21-multi-select-entry-handlers-bound.md) | behavior, type |
| 2026-11-21 | [SmallListItemButton draws a keyboard focus ring](2026-11-21-small-list-item-button-focus-ring.md) | behavior |
| 2026-11-21 | [ImageSelector clears its file input after every pick](2026-11-21-image-selector-clears-input-after-pick.md) | behavior |
| 2026-11-21 | [The import review validates the record the import writes](2026-11-21-import-review-validates-written-record.md) | behavior |
| 2026-11-21 | [The import upload replaces its file with a new pick](2026-11-21-import-upload-replaces-file.md) | behavior |
| 2026-11-21 | [The filter panel's GridSingleSelectFilter and GridMultiSelectFilter honor hidden, isDisabled and [text, node] labels](2026-11-21-grid-select-filters-panel-option-flags.md) | behavior |
| 2026-11-21 | [A DataGrid filter bar narrower than 600px opens as a panel by default](2026-11-21-data-grid-filter-bar-default-dialog-width.md) | behavior |
| 2026-11-21 | [buildDateColumns shows the month on the first column and on every 1st](2026-11-21-matrix-date-columns-show-month.md) | behavior |
| 2026-11-21 | [The image viewers zoom by buttons and keys](2026-11-21-image-viewers-zoom-by-keyboard.md) | behavior, theme |
| 2026-11-21 | [A Matrix tile marks the entries it leaves out with "+N"](2026-11-21-matrix-tile-marks-left-out-entries.md) | behavior |
| 2026-11-21 | [A file's remove and restore are buttons named after the file](2026-11-21-file-upload-remove-restore-buttons.md) | behavior, type, theme |
| 2026-11-21 | [Schedule entries call onAuxClick for the middle button only](2026-11-21-schedule-entry-aux-click-middle-button-only.md) | behavior |
| 2026-11-21 | [WeeklySchedule reloads the shown week when the language changes](2026-11-21-weekly-schedule-reloads-on-language-change.md) | behavior |
| 2026-11-21 | [WeeklySchedule marks today's column by more than its color](2026-11-21-weekly-schedule-today-column-marked.md) | behavior |
| 2026-11-21 | [The MUI multi-checkbox enum renderer draws a keyboard focus ring](2026-11-21-enum-multi-checkbox-focus-ring.md) | behavior |
| 2026-11-21 | [Matrix aggregate cells say their badge and their column](2026-11-21-matrix-aggregate-cell-names.md) | behavior |
| 2026-11-20 | [CountryCodes and useCountryOptions list every ISO 3166-1 country: Aruba, Curaçao, Sint Maarten and 12 more territories](2026-11-20-country-codes-every-iso-3166-1-country.md) | behavior, type |
| 2026-11-20 | [ColorInput reports a blur once focus leaves the field and its picker, and a picker opened from the keyboard shows its focus](2026-11-20-color-input-blur-on-leaving-the-field.md) | behavior, type |
| 2026-11-20 | [The busy overlay's spinner sits on a disc of its own](2026-11-20-form-loader-overlay-spinner-disc.md) | behavior, theme |
| 2026-11-20 | [RoutedMenu honors forceExpand on its entries](2026-11-20-routed-menu-force-expand.md) | behavior |
| 2026-11-20 | [A grid keeps keyboard focus when its persistence provider's storage keys change](2026-11-20-data-grid-persist-key-change-keeps-focus.md) | behavior |
| 2026-11-20 | [LocaleSelectorDialog requires supportedLocales](2026-11-20-locale-selector-supported-locales-required.md) | behavior, type |
| 2026-11-20 | [A lazy control's onParentIdChange is called after the control mounted, not while it renders](2026-11-20-lazy-crud-connector-parent-id-after-mount.md) | behavior |
| 2026-11-20 | [The locale selector marks the row of the current locale](2026-11-20-locale-selector-marks-current-locale.md) | behavior, theme |
| 2026-11-20 | [The CRUD selects no longer take initialSelected](2026-11-20-crud-select-initial-selected-removed.md) | type, behavior |
| 2026-11-20 | [GroupBox applies `classes.legend`](2026-11-20-group-box-classes-legend.md) | behavior, theme |
| 2026-11-20 | [A selector's switch takes the label's row alone when the label does not fit beside it](2026-11-20-selector-switch-own-row-when-label-does-not-fit.md) | behavior |
| 2026-11-20 | [A theme that shows a selector's switch must set switchLabel](2026-11-20-selector-theme-switch-label.md) | type |
| 2026-11-20 | [An open InfoBox keeps its 48px header and has no margin; every InfoBox is rounded](2026-11-20-info-box-no-gutters-rounded-corners.md) | behavior |
| 2026-11-20 | [Model reports its errors through configureErrorReporting](2026-11-20-model-reports-through-error-reporting.md) | behavior |
| 2026-11-20 | [CrudMultiSelectWithGroups shows which entries were added and removed until they are saved](2026-11-20-crud-multi-select-with-groups-pending-changes.md) | behavior, type |
| 2026-11-20 | [SentryHistory is removed](2026-11-20-sentry-history-removed.md) | type |
| 2026-11-20 | [MultiLanguageInput's translate button draws a keyboard focus ring](2026-11-20-multi-language-input-translate-button-focus-ring.md) | behavior |
| 2026-11-20 | [A dirty disableRouting Form switches routed tabs without asking](2026-11-20-disable-routing-form-tab-switch.md) | behavior |
| 2026-11-20 | [A drop by onLoadError removes the id from the current selection](2026-11-20-backend-multi-select-drop-keeps-current-selection.md) | behavior |
| 2026-11-20 | [The Matrix overlay hint is opaque, and Escape hides the add hint](2026-11-20-matrix-add-hint-opaque-escape.md) | behavior |
| 2026-11-20 | [A click on a Link to the current location replaces the history entry](2026-11-20-link-to-current-location-replaces.md) | behavior |
| 2026-11-20 | [The sign dialog's drawing area is a named image, and the dialog says how to sign](2026-11-20-sign-dialog-sign-area-named-and-described.md) | behavior |
| 2026-11-20 | [The date pickers draw a keyboard focus ring in the calendar and on the open button](2026-11-20-picker-focus-ring.md) | behavior |
| 2026-11-20 | [The SignPad tile is a block, as tall as its min-height without a sized parent](2026-11-20-sign-pad-tile-is-a-block.md) | behavior |
| 2026-11-20 | [SignaturePad's dialog is part of the field: it follows the field's props and closes with it](2026-11-20-signature-pad-dialog-part-of-the-field.md) | behavior |
| 2026-11-20 | [A press on a clickable Matrix entry reaches the elements around it](2026-11-20-matrix-entry-press-reaches-wrappers.md) | behavior |
| 2026-11-20 | [DateInput has no timezone prop and ignores a timezone set in the theme](2026-11-20-date-input-no-timezone.md) | type, behavior |
| 2026-11-20 | [Notifications: the popover is a dialog, and the bell says it opens one](2026-11-20-notifications-popover-is-a-dialog.md) | behavior, type |
| 2026-11-20 | [The grid's cells are cells of their rows](2026-11-20-multi-grid-cells-are-grid-cells.md) | behavior |
| 2026-11-20 | [The touch Clear button leaves focus in the field](2026-11-20-clear-keeps-focus-in-field.md) | behavior |
| 2026-11-20 | [Text without a number is invalid in the number inputs](2026-11-20-number-inputs-flag-text-without-a-number.md) | behavior |
| 2026-11-20 | [IntegerInputField's root is its text field, without a wrapper div](2026-11-20-integer-input-field-root-is-its-text-field.md) | behavior |
| 2026-11-20 | [A text field's helper text stays in its description when slotProps.htmlInput adds to it](2026-11-20-text-field-helper-text-stays-in-description.md) | behavior |
| 2026-11-20 | [While a dialog button's handler runs, the buttons stay focusable and the pressed one shows a spinner](2026-11-20-dialog-busy-buttons-keep-focus.md) | behavior |
| 2026-11-20 | [showErrorDialog accepts any value and no longer throws](2026-11-20-show-error-dialog-accepts-any-value.md) | behavior, type, i18n |
| 2026-11-20 | [RoutedTabs scrolls when its tabs do not fit, with scroll buttons on phones](2026-11-20-routed-tabs-scroll-when-tabs-do-not-fit.md) | behavior, theme |
| 2026-11-20 | [DialogTitle wraps a long title instead of cutting it off](2026-11-20-dialog-title-wraps.md) | behavior |
| 2026-11-20 | [A toast's keyboard-focused close button draws a focus ring](2026-11-20-toast-close-button-focus-ring.md) | behavior |
| 2026-11-20 | [A CRUD without a record page applies gridProps.onAddNew and shows newPermissionHint only to users who may not create](2026-11-20-crud-without-record-page-add-new.md) | behavior |
| 2026-11-20 | [SignalPortlet's linked rows and Refresh button draw a keyboard focus ring](2026-11-20-signal-portlet-focus-ring.md) | behavior |
| 2026-11-20 | [TreeView is exposed as a tree: levels, positions among siblings and expanded state](2026-11-20-tree-view-is-a-tree.md) | behavior, type |
| 2026-11-20 | [Leaving several dirty forms asks once, and "Yes" keeps the forms it did not leave guarded](2026-11-20-leave-guards-ask-once.md) | behavior |
| 2026-11-20 | [A disabled default Back button looks like every disabled ActionButton](2026-11-20-default-back-button-disabled-look.md) | behavior |
| 2026-11-20 | [FullFormDialog's open-in-new action is a named button beside the close button](2026-11-20-full-form-dialog-open-in-new-button.md) | behavior, theme |
| 2026-11-20 | [InfiniteScroll opens at its first row and loads on top without hiding any of it](2026-11-20-infinite-scroll-loads-on-top-without-offset.md) | behavior, type |
| 2026-11-20 | ["Clear filters" in an empty DataGrid moves focus to the search box](2026-11-20-data-grid-clear-filters-focuses-search.md) | behavior |
| 2026-11-20 | [The DataGrid's header buttons on tablets and phones and its column settings draw a focus ring](2026-11-20-data-grid-header-settings-focus-ring.md) | behavior |
| 2026-11-20 | [FormAutoSave also saves when the form turns idle or dirty](2026-11-20-form-auto-save-when-idle-or-dirty.md) | behavior |
| 2026-11-20 | [ScrollableSchedule starts over at the current week after a filter or language change](2026-11-20-scrollable-schedule-starts-over-at-current-week.md) | behavior |
| 2026-11-20 | [Portal menu entries and the burger tell screen readers their state](2026-11-20-portal-menu-exposes-state.md) | behavior |
| 2026-11-20 | [A collapsed CollapsibleMenu is shown in the mobile layout](2026-11-20-collapsible-menu-shown-in-mobile-layout.md) | behavior |
| 2026-11-20 | [PortalLayout keeps the menu mounted when it switches between desktop and mobile view](2026-11-20-portal-menu-kept-across-breakpoint.md) | behavior |
| 2026-11-20 | [ActionButton darkens a fill until its text reaches 4.5:1](2026-11-20-action-button-readable-fill.md) | behavior |
| 2026-11-20 | [ComponentWithLabel captions wrap when they have too little room](2026-11-20-component-with-label-captions-wrap.md) | behavior |
| 2026-11-20 | [A failed week of ScrollableSchedule keeps its week line and offers Retry](2026-11-20-scrollable-schedule-failed-week-retry.md) | behavior |
| 2026-11-20 | [A running delete shows its progress, and a finished one is announced](2026-11-20-data-grid-delete-progress-and-success-toast.md) | behavior, type |
| 2026-11-20 | [After a navigation the focus moves to the new page's heading, and the new page is announced](2026-11-20-navigation-focus-and-announcement.md) | behavior |
| 2026-11-20 | [A modified field says so in its name](2026-11-20-dirty-state-in-field-name.md) | behavior, type, theme |
| 2026-11-20 | [DecimalInputField and CurrencyInput commit an edit on Enter](2026-11-20-number-inputs-commit-on-enter.md) | behavior |
| 2026-11-20 | [HowToBox's theme gets no ownerState, and its variants match titleLabel and labels](2026-11-20-how-to-box-theme-without-owner-state.md) | type, behavior, theme |
| 2026-11-20 | [ScrollableSchedule marks today's row by default](2026-11-20-scrollable-schedule-today-row-marked.md) | behavior |
| 2026-11-20 | [A lazy control's queue keeps the Form dirty when onlySubmitMounted changes while it is shown](2026-11-20-lazy-crud-connector-only-submit-mounted-change.md) | behavior |
| 2026-11-20 | [A control in a DataGrid cell is named after its field and row](2026-11-20-data-grid-inline-checkbox-names.md) | behavior |
| 2026-11-20 | [InlineSwitch takes aria props for its switch, and a selector's switch requires switchLabel](2026-11-20-inline-switch-name-and-switch-label.md) | behavior, type |
| 2026-11-20 | [A Link to a location without pathname points at the current page](2026-11-20-link-href-without-pathname.md) | behavior |
| 2026-11-20 | [An aborted index, fetchAll or getRaw request is not reported to Sentry](2026-11-20-model-index-abort-not-reported.md) | behavior |
| 2026-11-20 | [The router's internals are no longer exported from the package root](2026-11-20-routes-internals-not-exported.md) | type |
| 2026-11-20 | [The InfoBox header announces a warning, success or error status](2026-11-20-info-box-announces-status.md) | behavior |
| 2026-11-20 | [RoutedTabs' panels are tab panels, named and controlled by their tabs](2026-11-20-routed-tabs-panels-are-tab-panels.md) | behavior, theme |
| 2026-11-20 | [Notifications: the popover is 400px wide by default](2026-11-20-notifications-default-paper-width.md) | behavior, theme |
| 2026-11-20 | [The corner of a diagonal Matrix pair is drawn in its entry's text color](2026-11-20-matrix-diagonal-corner-entry-color.md) | behavior |
| 2026-11-20 | [A disabled SignPad tile opens nothing, also when the theme disables it](2026-11-20-sign-pad-disabled-opens-nothing.md) | behavior |
| 2026-11-20 | [The grid's focus ring is drawn above its cells](2026-11-20-multi-grid-focus-ring-above-cells.md) | behavior, theme |
| 2026-11-20 | [A signature field's label is a `<label>`, not a `<legend>`](2026-11-20-signature-field-label-not-legend.md) | behavior |
| 2026-11-20 | [A date picker's `aria-label` names its field and calendar, and the calendar is always named](2026-11-20-picker-aria-label-names-field-and-calendar.md) | behavior |
| 2026-11-20 | [A date picker follows a value handed in another timezone](2026-11-20-picker-follows-value-timezone.md) | behavior |
| 2026-11-20 | [A date picker with a warning or a dirty value shows both, like a text field](2026-11-20-picker-field-states.md) | behavior |
| 2026-11-20 | [GroupBox's theme variants match smallLabel and label](2026-11-20-group-box-variants-match-small-label.md) | behavior, theme |
| 2026-11-20 | [DateInput passes the slots a consumer gives it on to the picker](2026-11-20-date-input-consumer-slots.md) | behavior |
| 2026-11-20 | [MultiLanguageInput's translate button is named after its field and says whether the other languages are shown](2026-11-20-multi-language-input-toggle-names-its-field.md) | behavior, i18n |
| 2026-11-20 | [A numeric Matrix label is sized like its digits, and a corner of 0 is drawn](2026-11-20-matrix-numeric-label-and-zero-corner.md) | behavior |
| 2026-11-20 | [A dirty Form in a tab panel asks before another tab replaces it](2026-11-20-form-page-guard-follows-routes.md) | behavior, type |
| 2026-11-19 | [PopupMenu applies its `classes`](2026-11-19-popup-menu-classes.md) | behavior, theme |
| 2026-11-19 | [A data grid logs a failed write of its persisted state and writes it again](2026-11-19-data-grid-failed-persist-write-logged-and-retried.md) | behavior |
| 2026-11-19 | [The busy overlay is a status message, and a busy form is `aria-busy`](2026-11-19-form-loader-overlay-status-message.md) | behavior, theme |
| 2026-11-19 | [The form footer stays within its container, and its buttons wrap](2026-11-19-form-footer-fits-its-container.md) | behavior, theme |
| 2026-11-19 | [RoutedMenu reads a route the same way for the highlight and the click](2026-11-19-routed-menu-route-one-reading.md) | behavior |
| 2026-11-19 | [The locale selector keeps keyboard focus in its list while it scrolls](2026-11-19-locale-selector-list-keeps-focus.md) | behavior |
| 2026-11-17 | [Leaving a date field marks it touched in a Form](2026-11-17-form-blur-marks-date-fields-touched.md) | behavior |
| 2026-11-17 | [VerticalDivider, PopupMenu and the Small components take theme default props](2026-11-17-small-primitives-theme-slots.md) | behavior, type, theme |
| 2026-11-17 | [The country flags load when the first flag is shown: loadCountryFlags and loadCountryFlag replace CountryFlags and getCountryFlag](2026-11-17-country-flags-load-when-shown.md) | type, behavior |
| 2026-11-17 | [A form page without buttons ends where its body ends](2026-11-17-form-page-layout-no-footer-no-space.md) | behavior |
| 2026-11-17 | [`disableHtmlLanguageAttributeSetter` leaves `<html lang>` to the app](2026-11-17-html-lang-setter-can-be-disabled.md) | behavior |
| 2026-11-17 | [RoutedMenu's highlight follows the URL only](2026-11-17-routed-menu-highlight-follows-url.md) | behavior |
| 2026-11-17 | [A lazy control reads its connector params once, for the list and the save alike](2026-11-17-lazy-crud-connector-params-read-once.md) | behavior |
| 2026-11-17 | [CrudSelect updates an entry only when what serialize returns for it changed](2026-11-17-crud-select-updates-by-serialized-entry.md) | behavior |
| 2026-11-17 | [Route params are percent-decoded, and literal route segments match the decoded location](2026-11-17-route-params-decoded.md) | behavior |
| 2026-11-17 | [A keyboard-focused InfoBox header keeps its status color and draws a ring](2026-11-17-info-box-focus-ring.md) | behavior |
| 2026-11-17 | [ComponentsCareI18n leads the UI language: apps change the language through it](2026-11-17-components-care-i18n-leads-the-language.md) | API |
| 2026-11-17 | [LocaleSelectorDialog reports the picked locale and stays open while it loads](2026-11-17-locale-selector-dialog-reports-the-pick.md) | behavior, type |
| 2026-11-17 | [LocaleSelectorDialog's supportedLocales match ignoring case, with _ read as -](2026-11-17-locale-selector-supported-locales-normalized.md) | behavior, type |
| 2026-11-17 | [LocaleSelectorDialog's visible box is the paper slot](2026-11-17-locale-selector-dialog-paper-slot.md) | theme |
| 2026-11-17 | [Theme style override functions of most CC components get no ownerState](2026-11-17-theme-style-overrides-without-owner-state.md) | type, theme |
| 2026-11-17 | [A disabled selector disables its switch](2026-11-17-base-selector-disabled-disables-switch.md) | behavior |
| 2026-11-17 | [A theme styles InlineSwitch's states through classes, not ownerState or variants](2026-11-17-inline-switch-state-classes.md) | type, theme |
| 2026-11-17 | [An inline edit in BackendDataGrid is saved like any other update](2026-11-17-data-grid-inline-edit-through-model-mutation.md) | behavior |
| 2026-11-17 | [Link leaves a click to the browser when it has target or download](2026-11-17-link-target-download-left-to-browser.md) | behavior |
| 2026-11-17 | [useAsyncMemo returns `{ value, error }`, and a failing factory sets `error`](2026-11-17-use-async-memo-error-state.md) | type, behavior |
| 2026-11-17 | [FormCrudMultiSelect shows which entries were added and removed until the form saves](2026-11-17-crud-multi-select-pending-changes.md) | behavior, type |
| 2026-11-17 | [PopupMenu breaks a word too long for a line](2026-11-17-popup-menu-breaks-long-words.md) | behavior |
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
| 2026-11-13 | [Saving a new record keeps the tab it was saved on](2026-11-13-crud-save-new-keeps-tab.md) | behavior |
| 2026-11-13 | [A form page's leave guard lasts as long as its Form](2026-11-13-form-page-guard-lasts-as-long-as-the-form.md) | behavior |
| 2026-11-13 | [The sign dialog scales a stored signature to fit its sign area](2026-11-13-sign-dialog-stored-signature-fits.md) | behavior |
| 2026-11-13 | [A signature field's button is named by its label, described by its message, and marked required and invalid](2026-11-13-signature-field-labelled-and-described.md) | behavior |
| 2026-11-13 | [FormDialog renders a button's color](2026-11-13-form-dialog-button-color.md) | behavior |
| 2026-11-13 | [A Toast rendered closed calls onExited right away](2026-11-13-toast-rendered-closed-calls-on-exited.md) | behavior |
| 2026-11-13 | [FlowEngineBackButton has no default label: children are required](2026-11-13-flow-engine-back-button-label-required.md) | type |
| 2026-11-13 | [InputDialog describes a rejected value in text and moves focus to the field](2026-11-13-input-dialog-error-text.md) | behavior |
| 2026-11-13 | [TreeView's scrollTo waits until its entry is visible and the list is measured](2026-11-13-tree-view-scroll-to-waits.md) | behavior |
| 2026-11-13 | [DefaultFormPage applies textButtonSave and textButtonBack](2026-11-13-form-page-button-labels.md) | behavior |
| 2026-11-13 | [TreeViewCheckboxSelectionRenderer disables a locked leaf's checkbox](2026-11-13-tree-checkbox-renderer-locked-leaf-disabled.md) | behavior |
| 2026-11-13 | [CurrencyInput reports an emptied field once, on blur](2026-11-13-currency-input-reports-emptied-field-on-blur.md) | behavior |
| 2026-11-13 | [A linked SignalPortlet row is a list item, with its button inside](2026-11-13-signal-portlet-linked-rows-are-list-items.md) | behavior, theme |
| 2026-11-13 | [A number whose . and , don't fit the locale's format is invalid](2026-11-13-localized-numbers-mixed-separators-invalid.md) | behavior |
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
