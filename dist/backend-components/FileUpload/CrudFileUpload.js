import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import FileUpload from "../../standalone/FileUpload/Generic";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import PartialDeleteError from "../../backend-integration/Connector/PartialDeleteError";
import { Loader } from "../../standalone";
/**
 * Marks an entry as one of `additionalFiles` rather than one of this control's own
 * @remarks Shape cannot tell the two apart. `FileData<BackendFileMeta>` is assignable to
 *          the `FileData<FileMeta>` the prop asks for, so an extra which was loaded from
 *          a backend and put through a deserializer carries an id exactly like ours do —
 *          and an extra taken for one of ours ends up in `files`, where it is listed a
 *          second time by the union below.
 *
 *          A symbol cannot collide with anything a caller puts on the entry, and it
 *          survives the copies the standalone control makes of every file it holds,
 *          because object spread carries own symbol keys.
 */
const ADDITIONAL_FILE = Symbol("CcCrudFileUpload.additionalFile");
const isAdditionalFile = (file) => ADDITIONAL_FILE in file;
const CrudFileUpload = (props, ref) => {
    const { connector: connectorProp, serialize, deserialize, onChange, additionalFiles, showDirtyState, onDirtyChange, ...otherProps } = props;
    // Read once: the first connector is the collection this control lists and writes for
    // as long as it is mounted, and a later one is ignored. Its list, pending changes and
    // uploads in flight all belong to the first, so another collection takes a remount (a
    // `key` per record).
    const pinnedConnector = useRef(connectorProp);
    pinnedConnector.current ??= connectorProp;
    const connector = pinnedConnector.current;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [files, setFiles] = useState([]);
    // Only a queued write can be shown as pending and undone. A direct connector has
    // already created or deleted the file by the time this returns, so there is nothing
    // to mark and a restore button would be a lie.
    const lazyConnector = connector instanceof LazyConnector ? connector : null;
    // Whether anything is still waiting to be written, for the dirty flag. The queue is
    // not React state, so working it at submit or cancelling an entry changes nothing
    // React watches; the listener below mirrors it.
    const [queueEmpty, setQueueEmpty] = useState(() => lazyConnector?.isQueueEmpty() ?? true);
    useEffect(() => {
        if (!lazyConnector)
            return;
        setQueueEmpty(lazyConnector.isQueueEmpty());
        return lazyConnector.addQueueChangeListener((queue) => {
            setQueueEmpty(queue.length === 0);
            // A write that left the queue was sent, also when the submit stopped at a
            // later one: a removed file is gone from the server, so it leaves the list
            // rather than losing its mark, and an added one is now simply a file. Left in
            // place, a removed file reads as an existing one, and removing it again sends
            // the same delete against an id the backend no longer knows. The writes this
            // control cancels itself were not sent: a cancelled upload never gets a server
            // id, and a restore clears the mark before it cancels the delete.
            setFiles((prev) => {
                let changed = false;
                const next = prev.flatMap((file) => {
                    const id = file.file.id;
                    if (file.changeState === "removed" &&
                        lazyConnector.getQueuedOperation(id) !== "delete") {
                        changed = true;
                        return [];
                    }
                    if (file.changeState === "added" && lazyConnector.mapId(id) !== id) {
                        changed = true;
                        return [{ ...file, changeState: undefined }];
                    }
                    return [file];
                });
                // a new list replaces the one the standalone control holds
                return changed ? next : prev;
            });
        });
    }, [lazyConnector]);
    // What each picked file became once it was uploaded, until the control lists that
    // instead. The list handed to handleChange comes from the standalone control, which
    // keeps its own copy of a picked file until our result reaches it — so a change made
    // before that, removing another file while the upload is still running, hands the
    // picked file back unchanged. Uploading it again would put a second copy on the
    // server. And a change which drops the picked file in that time, removing it or
    // picking another of the same name, drops an upload the control never listed, so
    // nothing marks that upload for deletion.
    const uploadedPicks = useRef(new Map());
    // ...which only helps if the upload that fills it has finished, so changes are
    // applied one after the other rather than side by side
    const pendingChange = useRef(Promise.resolve());
    // The ids a direct connector deleted. A change made while a delete was running hands
    // the file back as the standalone control still lists it: marked for deletion, or
    // restored if the user clicked restore meanwhile. Either way it is gone from the
    // server, and deleting it again would be refused.
    const goneIds = useRef(new Set());
    // The picks the user has made that no change has uploaded or refused yet. The
    // standalone control holds a pick in its own list only, until the upload reaches
    // `files`, and every new list handed down replaces that list: new additionalFiles,
    // or a restore while an upload runs, would drop the pick from view, and the next
    // change would then delete its upload as dropped by the user. So the list handed
    // down carries them.
    const pendingPicks = useRef([]);
    const applyChange = useCallback(async (newFiles) => {
        if (!connector)
            return;
        // What the connector queue says is pending for a file, rather than what the
        // list this change started with said. A change is applied a moment after it
        // was made, and the queue may have moved on in between — a change which
        // cancels the last queued write lands after the state which cleared the
        // marks, and would otherwise put the stale one back.
        const markOf = (id) => {
            const queued = lazyConnector?.getQueuedOperation(id);
            return queued === "create"
                ? "added"
                : queued === "delete"
                    ? "removed"
                    : undefined;
        };
        // gone from the server, whatever the list handed back says
        newFiles = newFiles.filter((file) => {
            const id = file.file.id;
            return !id || !goneIds.current.has(id);
        });
        const listedFiles = new Set(newFiles.map((file) => file.file));
        const listedIds = new Set(newFiles.map((file) => file.file.id));
        const droppedUploads = [];
        uploadedPicks.current.forEach((uploaded, pick) => {
            // still listed as the picked file, which is swapped for the upload below
            if (listedFiles.has(pick))
                return;
            uploadedPicks.current.delete(pick);
            // listed as itself, so from here on it is a file like any other
            if (listedIds.has(uploaded.file.id))
                return;
            // dropped before it was ever listed, so it is removed as if it had been
            droppedUploads.push({
                ...uploaded,
                delete: true,
                changeState: markOf(uploaded.file.id),
            });
        });
        newFiles = newFiles
            .map((file) => (file.canBeUploaded
            ? uploadedPicks.current.get(file.file)
            : null) ?? file)
            .concat(droppedUploads);
        // upload new files
        const picked = newFiles.filter((file) => file.canBeUploaded);
        // the names of the picks the connector took, whether or not their response
        // could then be read
        const storedNames = new Set();
        const uploads = await Promise.allSettled(picked.map(async (file) => {
            const response = await connector.create(await serialize(file));
            storedNames.add(file.file.name);
            return deserialize(response[0]);
        }));
        // A pick replaces the listed file of the same name, which comes marked for
        // deletion beside it. That file may only go once its replacement is stored,
        // which is why the deletes wait for the uploads: deleting it alongside an
        // upload the server refuses loses both versions. A LazyConnector gets the
        // delete queued behind the upload, so a save stopped by the upload has not
        // sent it either.
        const pickedNames = new Set(picked.map((file) => file.file.name));
        newFiles = newFiles.map((file) => file.delete &&
            pickedNames.has(file.file.name) &&
            !storedNames.has(file.file.name)
            ? { ...file, delete: false }
            : file);
        const deletedIds = newFiles
            .filter((file) => file.delete)
            .map((file) => file.file.id)
            // a queued removal stays marked, see below, and is queued once
            .filter((id) => lazyConnector?.getQueuedOperation(id) !== "delete");
        // A file whose upload is only queued has nothing on the server: removing it
        // cancels that upload, so it leaves the list rather than being shown as
        // removed.
        const cancelledUploads = new Set(newFiles
            .filter((file) => file.delete && file.changeState === "added")
            .map((file) => file.file.id));
        // Every write is accounted for on its own, rather than the first failure
        // taking the rest with it. The list comes back from the standalone control
        // with the picked files still in it, so an upload which went through but was
        // not recorded here is sent again by the next change, leaving a second copy
        // on the server.
        let error = null;
        // the ids whose delete was refused: those files are still on the server
        let refusedIds = new Set();
        try {
            await connector.deleteMultiple(deletedIds);
        }
        catch (e) {
            error = e;
            // only a PartialDeleteError says which ids went through
            refusedIds = new Set(e instanceof PartialDeleteError ? e.failedIds : deletedIds);
        }
        // a queued delete can still be cancelled, a sent one cannot
        if (!lazyConnector)
            deletedIds
                .filter((id) => !refusedIds.has(id))
                .forEach((id) => goneIds.current.add(id));
        const uploadedFiles = [];
        uploads.forEach((result, index) => {
            if (result.status === "rejected") {
                error = error ?? result.reason;
                return;
            }
            // canBeUploaded is what makes it a File, per FileData's own contract
            uploadedPicks.current.set(picked[index].file, result.value);
            uploadedFiles.push(result.value);
        });
        if (error)
            setError(error);
        const kept = newFiles.filter((file) => !file.canBeUploaded &&
            "id" in file.file &&
            // a delete the server refused has not happened: the file stays in the
            // list, still marked, for the next change to try again
            (!file.delete ||
                refusedIds.has(file.file.id) ||
                (!!lazyConnector &&
                    !cancelledUploads.has(file.file.id))));
        const finalFiles = kept
            .map((file) => {
            const changeState = markOf(file.file.id);
            return {
                ...file,
                // A delete a direct connector made has happened, so the flag is
                // spent. One the server refused has not, and stays set so that the
                // next change tries it again. A queued one stays set as well: the
                // file is gone once the queue is worked, which is what the flag
                // tells whoever counts the files, maxFiles included.
                delete: changeState === "removed" || refusedIds.has(file.file.id),
                changeState,
            };
        })
            .concat(uploadedFiles.map((file) => ({
            ...file,
            changeState: markOf(file.file.id),
        })));
        // uploaded or refused, so no longer a pick to carry
        const settledPicks = new Set(picked.map((file) => file.file));
        pendingPicks.current = pendingPicks.current.filter((file) => !settledPicks.has(file.file));
        // update state
        setFiles(finalFiles);
    }, [connector, deserialize, lazyConnector, serialize]);
    /**
     * Applies one change from the control, after every change before it
     * @remarks The standalone control fires a change per interaction, without waiting for
     *          what the last one did. Running them in order is what lets each see the
     *          uploads the ones before it made.
     */
    const handleChange = useCallback((newFiles) => {
        // The list handed back includes what was only passed through for display,
        // which this control neither stores nor writes, whatever flags it carries: a
        // `delete` or `canBeUploaded` of another control's list means nothing to this
        // connector, where its id may even be a different record.
        const ownFiles = newFiles.filter((file) => !isAdditionalFile(file));
        // the picks the user has now, whichever change uploads them
        pendingPicks.current = ownFiles.filter((file) => file.canBeUploaded);
        const change = pendingChange.current.then(() => applyChange(ownFiles));
        // a failed change must not stop the ones after it
        pendingChange.current = change.catch(() => undefined);
        return change;
    }, [applyChange]);
    // A CrudFileUpload is a custom form field: it is not in the model, so the form has no
    // per-field dirty state for it and nothing hands it `dirty`. With a lazy connector it
    // does not need one — a queued write *is* the pending change, which is the same thing
    // useLazyCrudConnector reports through setCustomFieldDirty.
    const pendingChanges = lazyConnector ? !queueEmpty : false;
    // an explicit prop wins, as it does over every other derived state here
    const dirty = otherProps.dirty ?? (showDirtyState ? pendingChanges : undefined);
    // state, not display: this reports the pending changes whether or not they are marked
    useEffect(() => {
        if (!onDirtyChange)
            return;
        onDirtyChange(pendingChanges);
    }, [onDirtyChange, pendingChanges]);
    const handleRestore = useCallback((file) => {
        if (!lazyConnector)
            return;
        const id = file.file.id;
        // by id, not by identity: the control keeps its own copies of the entries.
        // Before the cancel, which the queue listener would otherwise take for the
        // delete having been sent.
        setFiles((prev) => prev.map((entry) => entry.file.id === id
            ? { ...entry, delete: false, changeState: undefined }
            : entry));
        lazyConnector.cancelQueuedOperation(id);
    }, [lazyConnector]);
    const handleError = useCallback((_, msg) => {
        setError(new Error(msg));
    }, []);
    useEffect(() => {
        if (!connector || !loading)
            return;
        void (async () => {
            try {
                const initialData = await connector.index({
                    page: 1,
                    rows: Number.MAX_SAFE_INTEGER,
                });
                const initialFiles = await Promise.all(initialData[0].map((value) => Promise.resolve(deserialize(value))));
                // A pending change outlives this control: the queue sits on the connector,
                // so a control which was unmounted and mounted again — a language switch,
                // a route change — reads its marks back off it instead of starting blank.
                // A queued upload is in the index result already, a queued removal is not:
                // index hides it, and hands it back here.
                const removedFiles = lazyConnector
                    ? await Promise.all(lazyConnector
                        .getQueuedDeleteRecords()
                        .map((value) => Promise.resolve(deserialize(value))))
                    : [];
                setFiles([
                    ...initialFiles.map((file) => lazyConnector?.getQueuedOperation(file.file.id) === "create"
                        ? { ...file, changeState: "added" }
                        : file),
                    // at the end rather than where the backend had them: what index
                    // hands back carries no position
                    ...removedFiles.map((file) => ({
                        ...file,
                        delete: true,
                        changeState: "removed",
                    })),
                ]);
            }
            catch (e) {
                setLoadError(e);
            }
            finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connector]);
    // Reported when the list changes, to the handler passed last: a new handler alone is no
    // change, and an inline one that stores a derived list would otherwise render forever.
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    useEffect(() => {
        // The list is the server's only once loaded: before that, a field that has files
        // would report none, and after a failed load nothing is known.
        if ((connector && loading) || loadError)
            return;
        onChangeRef.current?.(files);
    }, [connector, files, loadError, loading]);
    // The picks are read only when the list changes for another reason: that is when the
    // standalone control would lose them. Until then it lists them itself.
    const finalFiles = useMemo(() => [
        ...files,
        ...(additionalFiles ?? []).map((file) => ({
            ...file,
            // read-only as documented: they are not this control's records, so a
            // remove would send a delete for an id which means something else
            // entirely to this connector
            preventDelete: true,
            [ADDITIONAL_FILE]: true,
        })),
        ...pendingPicks.current,
    ], [files, additionalFiles]);
    // without a connector there is nothing to load, only additionalFiles to list
    if (connector && loading)
        return _jsx(Loader, {});
    if (loadError)
        return _jsx("span", { children: loadError.message });
    const ErrorComponent = props.errorComponent;
    return (_jsxs(_Fragment, { children: [error && _jsx(ErrorComponent, { error: error }), _jsx(FileUpload, { ...otherProps, ref: ref, files: finalFiles, dirty: dirty, onChange: handleChange, onRestoreFile: lazyConnector ? handleRestore : undefined, handleError: handleError, 
                // undefined unless set, so that the theme's default applies
                readOnly: connector == null ? true : otherProps.readOnly })] }));
};
export default React.memo(React.forwardRef(CrudFileUpload));
