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
