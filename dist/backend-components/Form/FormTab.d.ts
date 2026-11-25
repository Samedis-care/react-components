import React from "react";
import { TabProps } from "@mui/material";
/**
 * Props of {@link FormTab}: MUI's `Tab` props, plus the fields on the tab and
 * the states to show on its label
 */
export interface FormTabProps extends Omit<TabProps, "ref"> {
    /**
     * The names of the model fields on this tab's panel, as in the model (dot
     * notation, e.g. `address.city`), matched exactly. The tab shows the state
     * of these fields while its panel is not rendered, which is the point:
     * RoutedTabs unmounts the panels of the other tabs, so their fields show
     * nothing.
     * - Modified marker: one of them shows the modified marker, i.e. it is
     *   marked in the `DirtyStateContext`. That follows the field's own marker:
     *   the Form's `showDirtyState` and an enclosing `DirtyStateProvider`. Without
     *   `showDirtyState` the tab is not marked either.
     * - Error marker: one of them has a validation error that its field shows,
     *   i.e. the field is touched and the Form has an error for it. A save
     *   touches every field, so after a save that failed validation every tab
     *   with an invalid field is marked.
     *
     * Read from the enclosing Form; outside a Form they mark nothing. A field
     * that is not in the model (a custom field) is marked through `dirty` and
     * `error` instead. Default: none.
     */
    fields?: readonly string[];
    /**
     * Shows the modified marker regardless of `fields`, e.g. for a custom field
     * or a form that computes its own marks. `false` and `undefined` (the
     * default) leave it to `fields`.
     */
    dirty?: boolean;
    /**
     * Shows the error marker regardless of `fields`, e.g. for a custom field's
     * validation. `false` and `undefined` (the default) leave it to `fields`.
     */
    error?: boolean;
}
/**
 * The theme slots of {@link FormTab} (`CcFormTab`): the label with its
 * markers, the modified marker and the error icon
 */
export type FormTabClassKey = "label" | "dirtyMarker" | "errorIcon";
declare const _default: React.NamedExoticComponent<FormTabProps & React.RefAttributes<HTMLDivElement>>;
export default _default;
