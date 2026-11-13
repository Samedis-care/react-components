import { useCallback, useContext, useEffect, useImperativeHandle, useRef, useState, } from "react";
import shallowCompare from "../../utils/shallowCompare";
import { FormContext } from "../Form";
import PartialApplyError from "../Form/PartialApplyError";
// the entry as the field names it, for the message of a write that failed
const labelOf = (entry) => typeof entry.label === "string" ? entry.label : entry.label[0];
const toPartialApplyError = (failures) => new PartialApplyError(failures
    .map((failure) => `${labelOf(failure.entry)}: ${failure.error.message}`)
    .join("; "), failures);
/**
 * Creates the row of a new entry. Rejects only when nothing was created: once the row
 * exists it is listed, so it can be removed and is not created a second time.
 */
const createEntry = async (connector, serialize, deserialize, entry) => {
    const record = (await connector.create(await serialize(entry)))[0];
    try {
        return { record, entry: await deserialize(record) };
    }
    catch (e) {
        return {
            record,
            entry: { ...entry, value: record.id },
            readError: e,
        };
    }
};
let ticketCounter = 0;
const nextTicket = () => {
    ticketCounter = (ticketCounter + 1) % Number.MAX_SAFE_INTEGER;
    return ticketCounter;
};
const useCrudSelect = (params, ref) => {
    const { connector, serialize, deserialize, deserializeModel, prepareNewEntry, onChange, initialSelected, validate, field, getIdOfData, } = params;
    const disabled = !!params.disabled || !!params.blockWrites;
    // read when a write would start, so a change queued or a handleSelect kept from an
    // earlier render does not write after the control was disabled
    const disabledRef = useRef(disabled);
    disabledRef.current = disabled;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [selected, setSelected] = useState([]);
    const currentSelected = useRef([]); // current state of selected, always set this and then use setSelected(currentSelected.current)
    const [initialRawData, setInitialRawData] = useState([]);
    // the entries listed for created rows whose deserialize failed, by row: the field
    // shows these instead of deserializing the row again
    const readFallbacks = useRef(new WeakMap());
    // async processing of add to selection
    const addToSelectionResults = useRef({});
    const addToSelectionInputs = useRef({});
    const [addToSelectionQueue, setAddToSelectionQueue] = useState([]);
    useImperativeHandle(ref, () => ({
        addToSelection: async (entry) => {
            // create ticket and add for async processing
            const ticket = nextTicket().toString(16) + ":" + Date.now().toString();
            const result = new Promise((resolve, reject) => {
                addToSelectionResults.current[ticket] = [resolve, reject];
            });
            addToSelectionInputs.current[ticket] = entry;
            setAddToSelectionQueue((prev) => [...prev, ticket]);
            return result;
        },
    }));
    // async processing of add to selection
    const fetchingAddSelection = useRef(false);
    useEffect(() => {
        if (loading)
            return;
        if (addToSelectionQueue.length === 0)
            return;
        if (fetchingAddSelection.current)
            return; // don't run this code twice
        fetchingAddSelection.current = true;
        const ticket = addToSelectionQueue[0];
        const entry = addToSelectionInputs.current[ticket];
        // if entry is undefined here we already started working on this, thus just wait and keep retrying
        if (entry === undefined) {
            // this happens when fetchingAddSelection is set to false before selection queue is updated (removed first entry) in finally handler of async code
            // this usually happens when addToSelection keeps getting called
            fetchingAddSelection.current = false; // allow retry
            return;
        }
        delete addToSelectionInputs.current[ticket];
        const [resolve, reject] = addToSelectionResults.current[ticket];
        delete addToSelectionResults.current[ticket];
        (async () => {
            if (loadError)
                throw new Error("CrudSelect loading failed");
            if (disabledRef.current)
                throw new Error("CrudSelect is disabled");
            const existing = currentSelected.current.find((selEntry) => getIdOfData(selEntry) === getIdOfData(entry));
            if (existing)
                return;
            const created = await createEntry(connector, serialize, deserialize, entry);
            if (created.readError)
                readFallbacks.current.set(created.record, created.entry);
            // store record in cache
            setInitialRawData((oldRawData) => [...oldRawData, created.record]);
            currentSelected.current = [...currentSelected.current, created.entry];
            setSelected(currentSelected.current);
            if (created.readError)
                throw toPartialApplyError([
                    { entry: created.entry, action: "read", error: created.readError },
                ]);
        })()
            .then(resolve)
            .catch(reject)
            .finally(() => {
            fetchingAddSelection.current = false;
            // state update re-triggers useEffect
            setAddToSelectionQueue((prev) => prev.filter((queueTicket) => queueTicket !== ticket));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, addToSelectionQueue]);
    // writes the change, whether the control is disabled or not: the initial load uses it
    const applySelection = useCallback(async (ids, reported) => {
        // an id reported without its entry (still loading in the field) keeps its entry
        const kept = selected.filter((entry) => ids.includes(entry.value) &&
            !reported.some((other) => other.value === entry.value));
        let newSelected = kept.length === 0
            ? reported
            : [...reported, ...kept].sort((a, b) => ids.indexOf(a.value) - ids.indexOf(b.value));
        // find new entries
        const newEntries = newSelected.filter((entry) => !selected.find((selEntry) => selEntry.value === entry.value));
        // remove new entries from array
        newSelected = newSelected.filter((entry) => selected.find((selEntry) => selEntry.value === entry.value));
        const changedEntries = newSelected.filter((entry) => {
            const oldEntry = selected.find((selEntry) => selEntry.value === entry.value);
            if (!oldEntry)
                return false;
            // remove all base selector data and multi selector data render options
            // this way we only update when the data actually changed
            const normalize = (record) => Object.assign({}, record, {
                label: null,
                icon: null,
                onClick: null,
                canUnselect: null,
                noDelete: null,
                isDisabled: null,
                selected: null,
                hidden: null,
                ignore: null,
                group: null,
                isAddNewButton: null,
                isDivider: null,
                isSmallLabel: null,
                className: null,
            });
            return !shallowCompare(normalize(entry), normalize(oldEntry));
        });
        const deletedEntries = selected.filter((entry) => !newSelected.find((selEntry) => selEntry.value === entry.value));
        // Every write settles on its own, rather than the first failure taking the
        // rest with it: the backend keeps what went through either way, so the
        // selection has to as well. Otherwise a record which was created is not
        // shown, and picking it again creates it a second time.
        const failures = [];
        const settle = async (action, entries, write) => {
            const results = await Promise.allSettled(entries.map(write));
            results.forEach((result, index) => {
                if (result.status === "rejected")
                    failures.push({
                        entry: entries[index],
                        action,
                        error: result.reason,
                    });
            });
            return results;
        };
        // call backend (updates/removals are independent of prepareNewEntry, fire eagerly)
        const updatePromise = settle("update", changedEntries, async (entry) => connector.update(await serialize(entry)));
        const deletePromise = settle("delete", deletedEntries, async (entry) => connector.delete((await serialize(entry)).id));
        // prepare new entries (collect extra join-record data / allow cancel).
        // run sequentially so simultaneous adds don't stack dialogs.
        const entriesToCreate = [];
        for (const entry of newEntries) {
            if (!prepareNewEntry) {
                entriesToCreate.push(entry);
                continue;
            }
            try {
                const prepared = await prepareNewEntry(entry);
                // null/undefined => cancel this addition cleanly (no create, no error)
                if (prepared == null)
                    continue;
                entriesToCreate.push(prepared);
            }
            catch (e) {
                failures.push({ entry, action: "create", error: e });
            }
        }
        // wait for response
        const created = (await settle("create", entriesToCreate, (entry) => createEntry(connector, serialize, deserialize, entry)))
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);
        created.forEach(({ record, entry, readError }) => {
            if (!readError)
                return;
            readFallbacks.current.set(record, entry);
            failures.push({ entry, action: "read", error: readError });
        });
        const updated = await updatePromise;
        const deleted = await deletePromise;
        // create final values: a refused update keeps the entry as it was, a
        // refused removal keeps the entry selected
        const finalSelected = [
            ...newSelected.map((entry) => {
                const index = changedEntries.indexOf(entry);
                if (index === -1 || updated[index].status === "fulfilled")
                    return entry;
                return (selected.find((selEntry) => selEntry.value === entry.value) ?? entry);
            }),
            ...deletedEntries.filter((_entry, index) => deleted[index].status === "rejected"),
            ...created.map(({ entry }) => entry),
        ];
        // reflect changes
        setInitialRawData((oldRawData) => [
            ...oldRawData,
            ...created.map(({ record }) => record),
        ]);
        currentSelected.current = finalSelected;
        setSelected(currentSelected.current);
        setError(failures.length > 0 ? toPartialApplyError(failures) : null);
    }, [connector, deserialize, prepareNewEntry, selected, serialize]);
    const handleSelect = useCallback(async (ids, newSelected) => {
        if (disabledRef.current)
            return;
        await applySelection(ids, newSelected);
    }, [applySelection]);
    const modelToSelectorData = useCallback(async (data) => {
        if (initialRawData.includes(data))
            return readFallbacks.current.get(data) ?? deserialize(data);
        const deserialized = (await deserializeModel(data));
        // Use a stable value derived from the record id (not Math.random()),
        // so rebuilds of not-yet-persisted entries keep the same value.
        // Otherwise handleSelect (which classifies new/changed/deleted by
        // value) would reclassify all surviving entries as new on any
        // selection change, re-running prepareNewEntry for each.
        return {
            ...deserialized,
            value: "to-create-" + getIdOfData(deserialized),
        };
    }, [deserialize, deserializeModel, getIdOfData, initialRawData]);
    // initial load
    useEffect(() => {
        void (async () => {
            setLoading(true);
            if (initialSelected) {
                await applySelection(initialSelected.map((entry) => entry.value), initialSelected);
                setLoading(false);
                return;
            }
            try {
                const currentlySelected = await connector.index({
                    page: 1,
                    rows: Number.MAX_SAFE_INTEGER,
                });
                const initialSelected = await Promise.all(currentlySelected[0].map((record) => Promise.resolve(deserialize(record))));
                setInitialRawData(currentlySelected[0]);
                currentSelected.current = initialSelected;
                setSelected(currentSelected.current);
            }
            catch (e) {
                // the field says that the load failed; the error's message is technical
                // eslint-disable-next-line no-console
                console.warn("[Components-Care] [CrudSelect] Could not load the selected entries:", e);
                setLoadError(e);
            }
            finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // on change event
    useEffect(() => {
        if (onChange)
            onChange(selected);
    }, [onChange, selected]);
    // validations
    const formCtx = useContext(FormContext);
    useEffect(() => {
        if (!formCtx || !validate || !field) {
            if (validate && process.env.NODE_ENV === "development") {
                const reasons = [];
                if (!formCtx)
                    reasons.push("Form context not present, validate only works inside of Components-Care Form Engine");
                if (!field)
                    reasons.push("Field prop not passed. This is required to register the validation handler with the Form Engine. This value has to be unique to the form");
                // eslint-disable-next-line no-console
                console.error("[Components-Care] [useCrudSelect] Crud Select has been given validate function, but can't be activated due to the following reasons", reasons);
            }
            return;
        }
        const { setCustomValidationHandler, removeCustomValidationHandler, onlyValidateMounted, } = formCtx;
        setCustomValidationHandler(field, () => validate(selected));
        return () => {
            if (onlyValidateMounted)
                removeCustomValidationHandler(field);
        };
    });
    return {
        loading,
        error,
        loadError,
        selected,
        initialRawData,
        handleSelect,
        modelToSelectorData,
        disabled,
    };
};
export default useCrudSelect;
