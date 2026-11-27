import { useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState, } from "react";
import toComparisonJson from "../../utils/toComparisonJson";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import { FormContextLite } from "../Form";
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
const noop = () => undefined;
/**
 * Queues a change of the selection behind the changes queued before it
 * @param queue The queue: settles once the last change queued so far has
 * @param change The change, started once the changes before it have settled
 * @returns What the change returns. One that rejects does not stop the ones after it.
 */
const queueChange = (queue, change) => {
    const run = (queue.current ?? Promise.resolve()).then(change);
    queue.current = run.then(noop, noop);
    return run;
};
const useCrudSelect = (params, ref) => {
    const { connector, serialize, deserialize, deserializeModel, prepareNewEntry, onChange, validate, field, getIdOfData, } = params;
    const disabled = !!params.disabled || !!params.blockWrites;
    // read when a write would start, so a change queued or a handleSelect kept from an
    // earlier render does not write after the control was disabled
    const disabledRef = useRef(disabled);
    disabledRef.current = disabled;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [selected, setSelected] = useState([]);
    // Only a queued write is pending: a LazyConnector sends it when the Form saves, any other
    // connector has written it by the time it returns.
    const lazyConnector = connector instanceof LazyConnector ? connector : null;
    // what a change works with once its turn comes: the connector and callbacks of the latest
    // render, not those of the render it was made in
    const latest = useRef({
        connector,
        lazyConnector,
        serialize,
        deserialize,
        prepareNewEntry,
        getIdOfData,
    });
    latest.current = {
        connector,
        lazyConnector,
        serialize,
        deserialize,
        prepareNewEntry,
        getIdOfData,
    };
    const [removed, setRemoved] = useState([]);
    // The queue is not React state: this counts its changes, so that what is read from it
    // is read again. A removal that left the queue was sent, or cancelled by a restore,
    // which selects the entry again: either way it is no longer listed as removed.
    const [queueVersion, setQueueVersion] = useState(0);
    useEffect(() => {
        if (!lazyConnector)
            return;
        return lazyConnector.addQueueChangeListener(() => {
            setQueueVersion((version) => version + 1);
            setRemoved((prev) => {
                const next = prev.filter((entry) => lazyConnector.getQueuedOperation(entry.value) === "delete");
                return next.length === prev.length ? prev : next;
            });
        });
    }, [lazyConnector]);
    const added = useMemo(() => lazyConnector
        ? selected
            .filter((entry) => lazyConnector.getQueuedOperation(entry.value) === "create")
            .map((entry) => entry.value)
        : [], 
    // queueVersion: the queue changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lazyConnector, selected, queueVersion]);
    const pendingChanges = !!lazyConnector && !lazyConnector.isQueueEmpty();
    // the groups of connector writes (a change's creates, updates or deletes, a create of
    // addToSelection) that have not settled yet: while there are any, the field is busy
    const [writes, setWrites] = useState(0);
    // the selection as the changes applied so far left it, ahead of the render that shows it:
    // always set this and then use setSelected(currentSelected.current)
    const currentSelected = useRef([]);
    // A write the LazyConnector's queue sends later (a Form's save) and the backend refuses
    // is named like a write through any other connector: by the label of the entry it was
    // for, in a PartialApplyError. The entry is found by its value, the record's id; if one
    // is not listed, the connector's own error stays.
    useEffect(() => {
        if (!lazyConnector)
            return;
        return lazyConnector.setQueueErrorFactory((failures) => {
            const entries = failures.map((failure) => currentSelected.current.find((entry) => entry.value === failure.id));
            if (!entries.every((entry) => entry !== undefined))
                return undefined;
            return toPartialApplyError(failures.map((failure, index) => ({
                entry: entries[index],
                action: failure.operation,
                error: failure.error,
            })));
        });
    }, [lazyConnector]);
    const [initialRawData, setInitialRawData] = useState([]);
    // the entries listed for created rows whose deserialize failed, by row: the field
    // shows these instead of deserializing the row again
    const readFallbacks = useRef(new WeakMap());
    // The changes of the selection (handleSelect, addToSelection) are applied one after
    // another, in the order they were made, once the selection has loaded: each waits until
    // the writes of the ones before it have settled, and changes the selection they left.
    const openChanges = useRef(noop);
    const changeQueue = useRef(null);
    changeQueue.current ??= new Promise((resolve) => {
        openChanges.current = resolve;
    });
    const loadFailed = useRef(false);
    // a change whose turn comes once the control has unmounted writes nothing
    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    // What the changes made and not applied yet are going to write: a later change leaves it
    // out, as it is the same gesture reported again (a second click on a remove button, a
    // pick reported before the field lists the first one). Removals by the entry's value,
    // picks by getIdOfData.
    const removing = useRef(new Set());
    const picking = useRef(new Set());
    useImperativeHandle(ref, () => ({
        addToSelection: (entry) => queueChange(changeQueue, async () => {
            if (!mounted.current)
                throw new Error("CrudSelect was unmounted");
            if (loadFailed.current)
                throw new Error("CrudSelect loading failed");
            if (disabledRef.current)
                throw new Error("CrudSelect is disabled");
            const { connector, serialize, deserialize, getIdOfData } = latest.current;
            const id = getIdOfData(entry);
            if (currentSelected.current.some((selEntry) => getIdOfData(selEntry) === id))
                return;
            setWrites((count) => count + 1);
            const created = await createEntry(connector, serialize, deserialize, entry).finally(() => setWrites((count) => count - 1));
            if (created.readError)
                readFallbacks.current.set(created.record, created.entry);
            // store record in cache
            setInitialRawData((oldRawData) => [...oldRawData, created.record]);
            currentSelected.current = [...currentSelected.current, created.entry];
            setSelected(currentSelected.current);
            if (created.readError)
                throw toPartialApplyError([
                    {
                        entry: created.entry,
                        action: "read",
                        error: created.readError,
                    },
                ]);
        }),
    }), []);
    const handleSelect = useCallback(async (ids, reported) => {
        if (disabledRef.current)
            return;
        const { getIdOfData } = latest.current;
        // The change is the difference between the selection the field lists, the one of
        // this render, and the one it reports. Only that difference is applied, to the
        // selection as the changes before it leave it: one reported from a render that
        // predates them does not undo them.
        const listed = selected;
        const listedEntry = (entry) => listed.find((selEntry) => selEntry.value === entry.value);
        // an id reported without its entry (still loading in the field) keeps its entry
        const kept = listed.filter((entry) => ids.includes(entry.value) &&
            !reported.some((other) => other.value === entry.value));
        const newSelected = [...reported, ...kept];
        // find new entries: one whose removal is still queued is restored, not created
        const isQueuedRemoval = (entry) => latest.current.lazyConnector?.getQueuedOperation(entry.value) ===
            "delete";
        const addedEntries = newSelected.filter((entry) => !listedEntry(entry));
        const restoredEntries = addedEntries.filter(isQueuedRemoval);
        // a pick of a record that a change before is creating is that pick reported again
        const newEntries = addedEntries.filter((entry) => !isQueuedRemoval(entry) && !picking.current.has(getIdOfData(entry)));
        // the same for a removal of an entry that a change before is deleting
        const deletedEntries = listed.filter((entry) => !newSelected.some((selEntry) => selEntry.value === entry.value) &&
            !removing.current.has(entry.value));
        const keptEntries = newSelected.filter(listedEntry);
        const pickedIds = newEntries.map(getIdOfData);
        pickedIds.forEach((id) => picking.current.add(id));
        deletedEntries.forEach((entry) => removing.current.add(entry.value));
        const applyChange = async () => {
            const { connector, lazyConnector, serialize, deserialize, prepareNewEntry, getIdOfData, } = latest.current;
            const current = currentSelected.current;
            const currentEntry = (entry) => current.find((selEntry) => selEntry.value === entry.value);
            // What the changes before did meanwhile: an entry they deleted is gone, and a
            // record they linked is a pick reported from a render before they settled.
            const toDelete = deletedEntries.filter(currentEntry);
            const linkedMeanwhile = new Set(current
                .filter((entry) => !listedEntry(entry))
                .map((entry) => getIdOfData(entry)));
            const toCreate = newEntries.filter((entry) => !linkedMeanwhile.has(getIdOfData(entry)));
            const toRestore = restoredEntries.filter((entry) => !currentEntry(entry));
            // An entry is updated only when what it would send differs from what the listed
            // entry sends. The field hands back copies of the listed entries (BackendMultiSelect
            // deserializes the rows itself), so neither a deserialize that builds a new object,
            // array or Date per call nor a field serialize leaves out (label, titleTooltip,
            // freeSolo, onClick, …) may turn an untouched entry into a write. A serialize that
            // fails counts as a change, so the update reports it. What a change before wrote
            // meanwhile is not written again.
            const differs = async (oldEntry, entry) => {
                if (oldEntry === entry)
                    return false;
                try {
                    const [oldData, newData] = await Promise.all([
                        serialize(oldEntry),
                        serialize(entry),
                    ]);
                    return toComparisonJson(oldData) !== toComparisonJson(newData);
                }
                catch {
                    return true;
                }
            };
            const updateCandidates = keptEntries.filter(currentEntry);
            const changed = await Promise.all(updateCandidates.map(async (entry) => {
                const before = listedEntry(entry);
                const now = currentEntry(entry);
                if (!before || !now)
                    return false;
                return ((await differs(before, entry)) &&
                    (now === before || (await differs(now, entry))));
            }));
            const changedEntries = updateCandidates.filter((_entry, index) => changed[index]);
            // Every write settles on its own, rather than the first failure taking the
            // rest with it: the backend keeps what went through either way, so the
            // selection has to as well. Otherwise a record which was created is not
            // shown, and picking it again creates it a second time.
            const failures = [];
            const settle = async (action, entries, write) => {
                const counted = entries.length > 0;
                if (counted)
                    setWrites((count) => count + 1);
                const results = await Promise.allSettled(entries.map(write));
                if (counted)
                    setWrites((count) => count - 1);
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
            const deletePromise = settle("delete", toDelete, async (entry) => connector.delete((await serialize(entry)).id));
            // prepare new entries (collect extra join-record data / allow cancel).
            // run sequentially so simultaneous adds don't stack dialogs.
            const entriesToCreate = [];
            for (const entry of toCreate) {
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
            // a removal the LazyConnector queued is listed until it is sent or restored
            const queuedRemovals = toDelete.filter((entry, index) => deleted[index].status === "fulfilled" && isQueuedRemoval(entry));
            // Cancelled here, next to the state updates below, so that the entry leaves
            // `removed` (the queue listener) in the render it is selected again. A delete the
            // Form sent meanwhile cannot be cancelled: that entry stays removed.
            const restored = toRestore.filter((entry) => lazyConnector?.cancelQueuedOperation(entry.value) ?? false);
            // Apply the difference: a deleted entry leaves the selection, an updated one is
            // replaced in its place, and the restored and created ones are added at the end.
            // A refused removal or update leaves the entry as and where it is. A kept entry
            // that was not written takes what the field reported for it, unless a change
            // before replaced it meanwhile.
            const deletedValues = new Set(toDelete
                .filter((_entry, index) => deleted[index].status === "fulfilled")
                .map((entry) => entry.value));
            const replacementOf = (entry) => {
                const reportedEntry = keptEntries.find((other) => other.value === entry.value);
                if (!reportedEntry)
                    return entry;
                const index = changedEntries.indexOf(reportedEntry);
                if (index !== -1)
                    return updated[index].status === "fulfilled"
                        ? reportedEntry
                        : entry;
                return entry === listedEntry(entry) ? reportedEntry : entry;
            };
            const merged = currentSelected.current
                .filter((entry) => !deletedValues.has(entry.value))
                .map(replacementOf);
            const finalSelected = [
                ...merged,
                ...restored,
                ...created.map(({ entry }) => entry),
            ];
            // reflect changes
            if (created.length > 0)
                setInitialRawData((oldRawData) => [
                    ...oldRawData,
                    ...created.map(({ record }) => record),
                ]);
            if (finalSelected.length !== currentSelected.current.length ||
                finalSelected.some((entry, index) => entry !== currentSelected.current[index])) {
                currentSelected.current = finalSelected;
                setSelected(currentSelected.current);
            }
            if (queuedRemovals.length > 0)
                setRemoved((prev) => [...prev, ...queuedRemovals]);
            // the outcome of a change that wrote or tried to: one that went through clears
            // the error of a change before, one with nothing to write leaves it
            const wrote = toDelete.length +
                changedEntries.length +
                entriesToCreate.length +
                toRestore.length >
                0;
            if (wrote || failures.length > 0)
                setError(failures.length > 0 ? toPartialApplyError(failures) : null);
        };
        await queueChange(changeQueue, async () => {
            try {
                // a change whose turn comes while the control is disabled, or once it has
                // unmounted, writes nothing
                if (!mounted.current || disabledRef.current)
                    return;
                await applyChange();
            }
            finally {
                pickedIds.forEach((id) => picking.current.delete(id));
                deletedEntries.forEach((entry) => removing.current.delete(entry.value));
            }
        });
    }, [selected]);
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
    // initial load: the selection is the connector's rows, and loading it writes nothing
    useEffect(() => {
        void (async () => {
            setLoading(true);
            try {
                const currentlySelected = await connector.index({
                    page: 1,
                    rows: Number.MAX_SAFE_INTEGER,
                });
                const initialSelected = await Promise.all(currentlySelected[0].map((record) => Promise.resolve(deserialize(record))));
                // A removal queued before the control was last unmounted (a language
                // switch, a route change) is still pending: index hides it, and hands it back
                // here. A queued pick is in the index result already.
                const removedRecords = lazyConnector?.getQueuedDeleteRecords() ?? [];
                const removedEntries = await Promise.all(removedRecords.map((record) => Promise.resolve(deserialize(record))));
                // the removed records too: a restored entry is listed from its record
                setInitialRawData([...currentlySelected[0], ...removedRecords]);
                currentSelected.current = initialSelected;
                setSelected(currentSelected.current);
                setRemoved(removedEntries);
            }
            catch (e) {
                // the field says that the load failed; the error's message is technical
                // eslint-disable-next-line no-console
                console.warn("[Components-Care] [CrudSelect] Could not load the selected entries:", e);
                loadFailed.current = true;
                setLoadError(e);
            }
            finally {
                setLoading(false);
                openChanges.current();
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // on change event
    useEffect(() => {
        if (onChange)
            onChange(selected);
    }, [onChange, selected]);
    // validations: the lite context has what they need and does not change with the Form's
    // values, so a value change elsewhere in the Form does not render the selector again
    const formCtx = useContext(FormContextLite);
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
        added,
        removed,
        pendingChanges,
        writing: writes > 0,
        initialRawData,
        handleSelect,
        modelToSelectorData,
        disabled,
    };
};
export default useCrudSelect;
