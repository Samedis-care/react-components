import { jsx as _jsx } from "react/jsx-runtime";
import React, { useRef } from "react";
import CrudMultiSelect from "../../Selector/CrudMultiSelect";
import useLazyCrudConnector, { extractLazyCrudConnectorParams, } from "../useLazyCrudConnector";
import { FORM_SUBMITTING_READ_ONLY_REASON, useFormContextLite } from "../Form";
/**
 * A CrudMultiSelect for a collection that belongs to the Form's record, e.g. its join records
 * @remarks Only for use in a Form: it throws outside one. Picks and removals are queued in a
 *          LazyConnector (useLazyCrudConnector, from `field`, `getEndpoint`, `initialId` and
 *          the other params of the hook) and sent after the Form saved the record. The
 *          Form's custom state of `field` holds that connector, and `validate` reports under
 *          `field`. These params are read once: a later `getEndpoint`, `field` or other param
 *          of the hook changes neither the list nor the save, and `validate` keeps reporting
 *          under the first `field`. Another collection takes another `field` and a new mount,
 *          e.g. `key={field}`.
 *
 *          How the entries come about:
 *          - A listed entry is `deserialize(record)` of a record of the collection; its
 *            `value` is the record's `id`, `getIdOfData` gives the id of the picked record
 *            of `model`.
 *          - A pick is `deserializeModel(record)` with the value
 *            `"to-create-" + getIdOfData(entry)`, and `serialize(entry)` is queued as a create.
 *            Leave that value out of what serialize returns for a new entry, or it is sent
 *            with the create. An end adornment that hands handleSelect a new entry builds it
 *            with the select context's `modelToSelectorData`.
 *          - The queued create comes back through `deserialize`, as serialize returned it,
 *            with a client-side id (`"fake-id-N"`) as `id`, which stays as long as the Form
 *            edits the record, also after the save (see useLazyCrudConnector): derive
 *            nothing but `value` from `id`, and read the picked record's id from a field
 *            serialize returns.
 */
const FormCrudMultiSelect = (props, ref) => {
    const [connectorParams, otherProps] = extractLazyCrudConnectorParams(props);
    const { connector } = useLazyCrudConnector(connectorParams);
    // read once, like the connector's: the validate messages stay under the queue's name
    const field = useRef(connectorParams.field).current;
    const { readOnly, readOnlyReasons, errorComponent, showDirtyState } = useFormContextLite();
    // a save makes the Form read-only too, but changing the field then would take the user's
    // focus and typed search away: while it runs, the field only takes no picks or removals
    const readOnlyBesidesSaving = Object.keys(readOnlyReasons).some((reason) => reason !== FORM_SUBMITTING_READ_ONLY_REASON);
    // the caller's props first: the Form's state wins, so an explicit falsy readOnly or
    // blockWrites cannot unlock the control in a read-only or saving form
    return (_jsx(CrudMultiSelect, { ...otherProps, connector: connector, errorComponent: errorComponent, readOnly: otherProps.readOnly || readOnlyBesidesSaving, blockWrites: otherProps.blockWrites || readOnly, showDirtyState: otherProps.showDirtyState ?? showDirtyState, field: field, ref: ref }));
};
const ForwardedFormCrudMultiSelect = React.forwardRef(FormCrudMultiSelect);
export default React.memo(ForwardedFormCrudMultiSelect);
