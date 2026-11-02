import React, {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	MultiImageImage,
	MultiImageNewIdPrefix,
	MultiImageProps,
} from "../../standalone/FileUpload/MultiImage/MultiImage";
import { Connector } from "../../backend-integration";
import PartialDeleteError from "../../backend-integration/Connector/PartialDeleteError";
import PartialApplyError, {
	PartialApplyFailure,
} from "../Form/PartialApplyError";
import describeWriteFailures from "./describeWriteFailures";
import describeFrameBy from "./describeFrameBy";
import { ErrorComponentProps } from "../Form";
import { MultiImage } from "../../standalone";
import CrudLoadStatus from "./CrudLoadStatus";

export interface CrudMultiImageProps extends Omit<
	MultiImageProps,
	"images" | "onChange" | "dialogMessage" | "onDialogOpenChange" | "busy"
> {
	/**
	 * Images of someone else, listed before this control's own
	 * @remarks Read-only whatever their `readOnly` says: never removed, replaced or
	 *          written through `connector`.
	 */
	additionalImages?: MultiImageImage[];
	/**
	 * Set while `additionalImages` is still loading
	 * @remarks Until they have arrived once, the field shows that it is loading. A later
	 *          reload leaves the field as it is: it keeps listing the additional images
	 *          passed last, and is marked busy until the new ones arrive. Listed without
	 *          them, a primary that is one of them would fall back to the first own image.
	 */
	additionalImagesLoading?: boolean;
	/**
	 * The backend connector used as CRUD interface
	 * @remarks A LazyConnector queues every write until its queue is written, which a Form
	 *          does after saving. Any other connector is written at once. The field looks
	 *          the same either way.
	 *
	 *          Null renders a read-only control that lists `additionalImages`. Read once:
	 *          the first connector passed (after null, if any) is listed and written for
	 *          as long as the control is mounted, and a later one is ignored. To show
	 *          another collection, remount the control, e.g. with a `key` per record.
	 */
	connector: Connector | null;
	/**
	 * Renders the error of a refused create, update or delete, where the user is when it
	 * arrives: at the top of the edit dialog while that is open, above the field otherwise
	 * @remarks An error shown in the dialog is dismissed when the dialog closes. One shown
	 *          above the field stays there while the dialog is open.
	 */
	errorComponent: React.ComponentType<ErrorComponentProps>;
	/**
	 * Callback for delete confirmation, asked before an image is removed
	 * @remarks The field has no undo for a removal: without a LazyConnector it deletes the
	 *          image on the server at once, with one it is queued until the queue is written.
	 * @see MultiImageProps.onDelete
	 */
	onDelete?: MultiImageProps["onDelete"];
	/**
	 * Callback for serializing data before passing it to the backend connector
	 * @param data The image data to serialize
	 * @param id The id of the image data or null for new
	 * @returns Data to be passed to the backend connector
	 */
	serialize: (
		data: MultiImageImage,
		id: string | null,
	) => Promise<Record<string, unknown>> | Record<string, unknown>;
	/**
	 * Callback for deserializing data after getting it from the backend connector
	 * @param data A record from the connector: a row of `index`, or what `create` or
	 *             `update` returned. From a LazyConnector, a queued write is what
	 *             `serialize` returned, a new image with a client-side `id`
	 *             (`fake-id-N`). It is listed that way by `index` too, until the queue is
	 *             written.
	 * @returns The image data which can be used by the control
	 */
	deserialize: (
		data: Record<string, unknown>,
	) => Promise<BackendMultiImageImage> | BackendMultiImageImage;
	/**
	 * Called with this control's own images whenever they change: once they are loaded,
	 * and after each change was written or queued
	 * @param name The name of this field
	 * @param newImages Without `additionalImages`. With a LazyConnector, an image created
	 *                  through it keeps its client-side id, also after the queue was
	 *                  written: `LazyConnector.mapId` gives the server's.
	 * @remarks Not called before the images are loaded, after a failed load, or for a new
	 *          handler alone.
	 */
	onChange?: (
		name: string | undefined,
		newImages: BackendMultiImageImage[],
	) => void;
}

export interface BackendMultiImageImage extends MultiImageImage {
	/**
	 * Was the image the primary one when it was last written?
	 * @remarks Set for `serialize` when the image is created or replaced. The primary
	 *          itself is the owner's (`primary`, `onPrimaryChange`).
	 */
	primary?: boolean;
	/**
	 * The image's position in the list, set for `serialize` when it is created or replaced
	 */
	index?: number;
}

/**
 * The error of the last change, and where it is shown
 */
interface WriteError {
	error: Error;
	/**
	 * Arrived while the edit dialog was open, so it is shown in it
	 */
	inDialog: boolean;
}

/**
 * What the user did in one change, relative to the images the control showed
 */
interface ImageChange {
	/**
	 * The ids of the own images the user removed
	 */
	removed: string[];
	/**
	 * Own images whose image the user replaced, under their ids
	 */
	replaced: MultiImageImage[];
	/**
	 * Images the user added, under their temporary ids
	 */
	added: MultiImageImage[];
}

/**
 * A MultiImage over a collection of image records behind `connector`, one record per image
 * @remarks It lists `connector.index` through `deserialize`, and writes each change of the
 *          user after the one before it: an added image is created, a replaced one
 *          updated, each through `serialize` and `deserialize`, and a removed one goes to
 *          `connector.deleteMultiple`. What went through is listed, what was refused is
 *          reported through `errorComponent`.
 *
 *          With a LazyConnector the writes are queued, but nothing marks them: there are
 *          no pending marks, no restore and no dirty marker. With any other connector a
 *          removal deletes the image at once; `onDelete` can ask first.
 *
 *          It does not read the Form it is in: in a Form, use FormCrudMultiImage, which
 *          builds the LazyConnector and takes the Form's `readOnly` and
 *          `errorComponent`. The primary image is the owner's to store, e.g. with the
 *          parent record. With a LazyConnector, the parent record is saved before the
 *          queue is written, so a new image's id is still client-side then.
 *
 *          An image the browser cannot decode is refused by MultiImage, through `onError`
 *          or its own dialog, not through `errorComponent`.
 */
const CrudMultiImage = (props: CrudMultiImageProps) => {
	const {
		connector: connectorProp,
		errorComponent: ErrorComponent,
		serialize,
		deserialize,
		onChange,
		additionalImages,
		additionalImagesLoading,
		...otherProps
	} = props;
	const { name, primary, onPrimaryChange } = otherProps;

	// Read once: the first connector is the collection this control lists and writes for
	// as long as it is mounted, and a later one is ignored. Its list, changes and uploads
	// in flight all belong to the first, so another collection takes a remount (a
	// `key` per record).
	const pinnedConnector = useRef(connectorProp);
	pinnedConnector.current ??= connectorProp;
	const connector = pinnedConnector.current;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<WriteError | null>(null);
	// for the field to reference the error while it is shown with it
	const errorId = useId();
	// The edit dialog is modal and hides the rest of the page, so an error that arrives
	// while it is open is shown in it. It is not moved out when the dialog closes, but
	// dismissed: moved, it would be mounted again, and an error component that shows a
	// dialog of its own (DefaultErrorComponent) would show it twice.
	const dialogOpen = useRef(false);
	const handleDialogOpenChange = useCallback((open: boolean) => {
		dialogOpen.current = open;
		if (!open) setError((prev) => (prev?.inDialog ? null : prev));
	}, []);
	const [loadError, setLoadError] = useState<Error | null>(null);
	const [images, setImages] = useState<BackendMultiImageImage[]>([]);
	// the primary when a change is done, which may have moved on since it started
	const primaryRef = useRef(primary);
	primaryRef.current = primary;

	// The images as last written, for the change that comes next to start from. Changes
	// are applied one after the other, and a change applied in the meantime has not been
	// rendered yet.
	const imagesRef = useRef<BackendMultiImageImage[]>([]);
	const commitImages = useCallback((next: BackendMultiImageImage[]) => {
		imagesRef.current = next;
		setImages(next);
	}, []);
	const pendingChange = useRef<Promise<unknown>>(Promise.resolve());
	// the changes handed in that have not settled yet: while there are any, the field is
	// busy
	const [writing, setWriting] = useState(0);

	const applyChange = useCallback(
		async ({ removed, replaced, added }: ImageChange) => {
			if (!connector) return;
			const latest = imagesRef.current;
			const latestById = new Map(latest.map((img) => [img.id, img]));
			// what an earlier change removed is gone: there is nothing left to remove or
			// replace
			const removedIds = removed.filter((id) => latestById.has(id));
			const replacements = new Map(
				replaced
					.filter((img) => {
						const old = latestById.get(img.id);
						return !!old && (old.image !== img.image || old.name !== img.name);
					})
					.map((img) => [img.id, img]),
			);
			// written at the position each will have in the list
			const writes = [
				...latest
					.filter((img) => !removedIds.includes(img.id))
					.map((img) => replacements.get(img.id) ?? img),
				...added,
			].flatMap((img, index) =>
				replacements.has(img.id) || added.includes(img) ? [{ img, index }] : [],
			);

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
			// every write that did not go through, reported together
			const failures: PartialApplyFailure<MultiImageImage>[] = [];
			let refusedIds: string[] = [];
			if (deleteResult.status === "rejected") {
				const e = deleteResult.reason as unknown;
				// only a PartialDeleteError says which ids went through, and its cause why
				refusedIds = e instanceof PartialDeleteError ? e.failedIds : removedIds;
				const reason =
					e instanceof PartialDeleteError && e.cause instanceof Error
						? e.cause
						: (e as Error);
				refusedIds.forEach((id) => {
					const img = latestById.get(id);
					if (img)
						failures.push({ entry: img, action: "delete", error: reason });
				});
			}
			const written = new Map<MultiImageImage, BackendMultiImageImage>();
			uploadResults.forEach((result, i) => {
				if (result.status === "fulfilled") {
					written.set(writes[i].img, result.value);
					return;
				}
				const { img } = writes[i];
				const isNew = img.id.startsWith(MultiImageNewIdPrefix);
				failures.push({
					// a replacement is reported as the image it was to replace
					entry: isNew ? img : (latestById.get(img.id) ?? img),
					action: isNew ? "create" : "update",
					error: result.reason as Error,
				});
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
			const error =
				failures.length > 0
					? new PartialApplyError(
							describeWriteFailures(failures, (img) => img.name),
							failures,
						)
					: null;
			setError(error && { error, inDialog: dialogOpen.current });
			// The primary is the owner's, and only reported when this change moved it:
			// removing the primary image leaves none. Any other primary stays as it is,
			// whether it is one of these images, an additional one, or an id that is no
			// longer listed at all (an image deleted elsewhere).
			const current = primaryRef.current;
			if (onPrimaryChange && current && deletedIds.includes(current))
				onPrimaryChange(name, null);
		},
		[commitImages, connector, deserialize, name, onPrimaryChange, serialize],
	);

	// The additional images last passed while they were not loading, null until then. A
	// reload keeps them listed rather than taking down the field, and with it an open edit
	// dialog and the focus in it.
	const [shownAdditional, setShownAdditional] = useState<{
		images: MultiImageImage[] | undefined;
	} | null>(() =>
		additionalImagesLoading ? null : { images: additionalImages },
	);
	if (
		!additionalImagesLoading &&
		(shownAdditional === null || shownAdditional.images !== additionalImages)
	)
		setShownAdditional({ images: additionalImages });
	// Read-only whatever the caller passed: they are someone else's, so this control
	// neither removes nor replaces them. A change recognises them as these objects.
	const extras = useMemo(
		(): MultiImageImage[] | undefined =>
			shownAdditional?.images?.map((img) => ({ ...img, readOnly: true })),
		[shownAdditional],
	);

	/**
	 * Applies one change from the control, after every change before it
	 * @remarks MultiImage builds a change from the images it shows, which an earlier change
	 *          still being written has not updated yet. So the change is taken as what the
	 *          user did to those images, and applied to the images as the changes before it
	 *          left them: applied as a list, it would bring back what an earlier change
	 *          removed and drop what one added.
	 */
	const handleChange = useCallback(
		(
			_name: string | undefined,
			newImages: (MultiImageImage | BackendMultiImageImage)[],
		) => {
			const own = extras
				? newImages.filter((img) => !extras.includes(img))
				: newImages;
			const listedIds = new Set(own.map((img) => img.id));
			const shown = new Map(images.map((img) => [img.id, img]));
			const change: ImageChange = {
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
			setWriting((count) => count + 1);
			const applied = pendingChange.current.then(() => applyChange(change));
			// a failed change must not stop the ones after it
			pendingChange.current = applied
				.catch(() => undefined)
				.finally(() => setWriting((count) => count - 1));
			return applied;
		},
		[applyChange, extras, images],
	);
	const listedImages = useMemo(
		() => (extras ? extras.concat(images) : images),
		[extras, images],
	);
	const dialogError = useMemo(
		() =>
			error?.inDialog && <ErrorComponent error={error.error} id={errorId} />,
		[ErrorComponent, error, errorId],
	);
	// the field is hidden behind the edit dialog while that shows the error
	const describedBy = error && !error.inDialog ? errorId : undefined;
	const { slotProps } = otherProps;
	const multiImageSlotProps = useMemo(
		(): MultiImageProps["slotProps"] => ({
			...slotProps,
			groupBox: describeFrameBy(slotProps?.groupBox, describedBy),
		}),
		[slotProps, describedBy],
	);

	useEffect(() => {
		// without a connector there is nothing to load, only additionalImages to list
		if (!connector || !loading) return;
		void (async () => {
			try {
				const initialData = await connector.index({
					page: 1,
					rows: Number.MAX_SAFE_INTEGER,
				});
				const initialFiles = await Promise.all(
					initialData[0].map((value) => Promise.resolve(deserialize(value))),
				);
				commitImages(initialFiles);
			} catch (e) {
				setLoadError(e as Error);
			} finally {
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
		// The list is the server's only once loaded: before that, a field that has images
		// would report none, and after a failed load nothing is known.
		if ((connector && loading) || loadError) return;
		onChangeRef.current?.(name, images);
	}, [connector, images, loadError, loading, name]);

	if ((connector && loading) || loadError || !shownAdditional)
		return (
			<CrudLoadStatus
				label={otherProps.label}
				className={otherProps.className}
				kind={"images"}
				error={loadError}
			/>
		);

	return (
		<>
			{error && !error.inDialog && (
				<ErrorComponent error={error.error} id={errorId} />
			)}
			<MultiImage
				{...otherProps}
				images={listedImages}
				busy={writing > 0 || !!additionalImagesLoading}
				slotProps={multiImageSlotProps}
				dialogMessage={dialogError}
				onDialogOpenChange={handleDialogOpenChange}
				onChange={handleChange}
				// undefined unless set, so that the theme's default applies
				readOnly={connector == null ? true : otherProps.readOnly}
			/>
		</>
	);
};

export default React.memo(CrudMultiImage);
