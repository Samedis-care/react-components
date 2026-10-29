import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { MultiImageNewIdPrefix, } from "../../standalone/FileUpload/MultiImage/MultiImage";
import PartialDeleteError from "../../backend-integration/Connector/PartialDeleteError";
import { MultiImage } from "../../standalone";
import CrudLoadStatus from "./CrudLoadStatus";
const CrudMultiImage = (props) => {
    const { connector: connectorProp, errorComponent: ErrorComponent, serialize, deserialize, onChange, additionalImages, additionalImagesLoading, ...otherProps } = props;
    const { name, primary, onPrimaryChange } = otherProps;
    // Read once: the first connector is the collection this control lists and writes for
    // as long as it is mounted, and a later one is ignored. Its list, changes and uploads
    // in flight all belong to the first, so another collection takes a remount (a
    // `key` per record).
    const connector = useRef(connectorProp).current;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [images, setImages] = useState([]);
    // the primary when a change is done, which may have moved on since it started
    const primaryRef = useRef(primary);
    primaryRef.current = primary;
    // The images as last written, for the change that comes next to start from. Changes
    // are applied one after the other, and a change applied in the meantime has not been
    // rendered yet.
    const imagesRef = useRef([]);
    const commitImages = useCallback((next) => {
        imagesRef.current = next;
        setImages(next);
    }, []);
    const pendingChange = useRef(Promise.resolve());
    const applyChange = useCallback(async ({ removed, replaced, added }) => {
        const latest = imagesRef.current;
        const latestById = new Map(latest.map((img) => [img.id, img]));
        // what an earlier change removed is gone: there is nothing left to remove or
        // replace
        const removedIds = removed.filter((id) => latestById.has(id));
        const replacements = new Map(replaced
            .filter((img) => {
            const old = latestById.get(img.id);
            return !!old && (old.image !== img.image || old.name !== img.name);
        })
            .map((img) => [img.id, img]));
        // written at the position each will have in the list
        const writes = [
            ...latest
                .filter((img) => !removedIds.includes(img.id))
                .map((img) => replacements.get(img.id) ?? img),
            ...added,
        ].flatMap((img, index) => replacements.has(img.id) || added.includes(img) ? [{ img, index }] : []);
        // Every write is accounted for on its own: what went through is listed, what
        // was refused is reported, rather than one refusal hiding the rest.
        const [deleteResult, ...uploadResults] = await Promise.allSettled([
            (async () => connector.deleteMultiple(removedIds))(),
            ...writes.map(async ({ img, index }) => {
                const data = {
                    ...img,
                    index,
                    primary: primaryRef.current === img.id,
                };
                const isNew = img.id.startsWith(MultiImageNewIdPrefix);
                const response = isNew
                    ? await connector.create(await serialize(data, null))
                    : await connector.update(await serialize(data, img.id));
                return {
                    ...(await deserialize(response[0])),
                    index,
                    primary: data.primary,
                };
            }),
        ]);
        let error = null;
        let refusedIds = [];
        if (deleteResult.status === "rejected") {
            error = deleteResult.reason;
            // only a PartialDeleteError says which ids went through
            refusedIds =
                deleteResult.reason instanceof PartialDeleteError
                    ? deleteResult.reason.failedIds
                    : removedIds;
        }
        const written = new Map();
        uploadResults.forEach((result, i) => {
            if (result.status === "fulfilled")
                written.set(writes[i].img, result.value);
            else
                error = error ?? result.reason;
        });
        const deletedIds = removedIds.filter((id) => !refusedIds.includes(id));
        commitImages([
            // a refused replacement keeps the image it was to replace
            ...latest
                .filter((img) => !deletedIds.includes(img.id))
                .map((img) => {
                const replacement = replacements.get(img.id);
                return (replacement && written.get(replacement)) ?? img;
            }),
            // a refused upload leaves
            ...added.flatMap((img) => {
                const image = written.get(img);
                return image ? [image] : [];
            }),
        ]);
        // the outcome of this change: one that went through clears an earlier error
        setError(error);
        // The primary is the owner's, and only reported when this change moved it:
        // removing the primary image leaves none. Any other primary stays as it is,
        // whether it is one of these images, an additional one, or an id that is no
        // longer listed at all (an image deleted elsewhere).
        const current = primaryRef.current;
        if (onPrimaryChange && current && deletedIds.includes(current))
            onPrimaryChange(name, null);
    }, [commitImages, connector, deserialize, name, onPrimaryChange, serialize]);
    // Read-only whatever the caller passed: they are someone else's, so this control
    // neither removes nor replaces them. A change recognises them as these objects.
    const extras = useMemo(() => additionalImages?.map((img) => ({ ...img, readOnly: true })), [additionalImages]);
    /**
     * Applies one change from the control, after every change before it
     * @remarks MultiImage builds a change from the images it shows, which an earlier change
     *          still being written has not updated yet. So the change is taken as what the
     *          user did to those images, and applied to the images as the changes before it
     *          left them: applied as a list, it would bring back what an earlier change
     *          removed and drop what one added.
     */
    const handleChange = useCallback((_name, newImages) => {
        const own = extras
            ? newImages.filter((img) => !extras.includes(img))
            : newImages;
        const listedIds = new Set(own.map((img) => img.id));
        const shown = new Map(images.map((img) => [img.id, img]));
        const change = {
            removed: images
                .filter((img) => !listedIds.has(img.id))
                .map((img) => img.id),
            // an entry the control did not hand out itself: its image was replaced
            replaced: own.filter((img) => {
                const before = shown.get(img.id);
                return !!before && before !== img;
            }),
            added: own.filter((img) => img.id.startsWith(MultiImageNewIdPrefix)),
        };
        const applied = pendingChange.current.then(() => applyChange(change));
        // a failed change must not stop the ones after it
        pendingChange.current = applied.catch(() => undefined);
        return applied;
    }, [applyChange, extras, images]);
    const listedImages = useMemo(() => (extras ? extras.concat(images) : images), [extras, images]);
    useEffect(() => {
        void (async () => {
            try {
                const initialData = await connector.index({
                    page: 1,
                    rows: Number.MAX_SAFE_INTEGER,
                });
                const initialFiles = await Promise.all(initialData[0].map((value) => Promise.resolve(deserialize(value))));
                commitImages(initialFiles);
            }
            catch (e) {
                setLoadError(e);
            }
            finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Reported when the list changes, to the handler passed last: a new handler alone is no
    // change, and an inline one that stores a derived list would otherwise render forever.
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    useEffect(() => {
        // The list is the server's only once loaded: before that, a field that has images
        // would report none, and after a failed load nothing is known.
        if (loading || loadError)
            return;
        onChangeRef.current?.(name, images);
    }, [images, loadError, loading, name]);
    if (loading || additionalImagesLoading || loadError)
        return (_jsx(CrudLoadStatus, { label: otherProps.label, className: otherProps.className, kind: "images", error: loadError }));
    return (_jsxs(_Fragment, { children: [error && _jsx(ErrorComponent, { error: error }), _jsx(MultiImage, { ...otherProps, images: listedImages, onChange: handleChange })] }));
};
export default React.memo(CrudMultiImage);
