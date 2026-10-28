import React, {
	useCallback,
	useEffect,
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
import { ErrorComponentProps } from "../Form";
import { Loader, MultiImage } from "../../standalone";

export interface CrudMultiImageProps extends Omit<
	MultiImageProps,
	"images" | "onChange"
> {
	/**
	 * Images of someone else, listed before this control's own
	 * @remarks Read-only whatever their `readOnly` says: never removed, replaced or
	 *          written through `connector`.
	 */
	additionalImages?: MultiImageImage[];
	/**
	 * Optional additional images loading flag
	 * Should be set to true while additionalImages is null to prevent
	 * it loosing primary status
	 */
	additionalImagesLoading?: boolean;
	/**
	 * The backend connector used as CRUD interface
	 * @remarks Read once: the first connector is listed and written for as long as the
	 *          control is mounted, and a later one is ignored. To show another collection,
	 *          remount the control, e.g. with a `key` per record.
	 */
	connector: Connector;
	/**
	 * The error component that is used to display errors
	 */
	errorComponent: React.ComponentType<ErrorComponentProps>;
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
	 * @param data The data from the backend connector (index function)
	 * @returns The image data which can be used by the control
	 */
	deserialize: (
		data: Record<string, unknown>,
	) => Promise<BackendMultiImageImage> | BackendMultiImageImage;
	/**
	 * @see MultiImageProps.onChange
	 */
	onChange?: (
		name: string | undefined,
		newImages: BackendMultiImageImage[],
	) => void;
}

export interface BackendMultiImageImage extends MultiImageImage {
	primary?: boolean;
	index?: number;
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
	const connector = useRef(connectorProp).current;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
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

	const applyChange = useCallback(
		async ({ removed, replaced, added }: ImageChange) => {
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
			let error: Error | null = null;
			let refusedIds: string[] = [];
			if (deleteResult.status === "rejected") {
				error = deleteResult.reason as Error;
				// only a PartialDeleteError says which ids went through
				refusedIds =
					deleteResult.reason instanceof PartialDeleteError
						? deleteResult.reason.failedIds
						: removedIds;
			}
			const written = new Map<MultiImageImage, BackendMultiImageImage>();
			uploadResults.forEach((result, i) => {
				if (result.status === "fulfilled")
					written.set(writes[i].img, result.value);
				else error = error ?? (result.reason as Error);
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
		},
		[commitImages, connector, deserialize, name, onPrimaryChange, serialize],
	);

	// Read-only whatever the caller passed: they are someone else's, so this control
	// neither removes nor replaces them. A change recognises them as these objects.
	const extras = useMemo(
		(): MultiImageImage[] | undefined =>
			additionalImages?.map((img) => ({ ...img, readOnly: true })),
		[additionalImages],
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
			const applied = pendingChange.current.then(() => applyChange(change));
			// a failed change must not stop the ones after it
			pendingChange.current = applied.catch(() => undefined);
			return applied;
		},
		[applyChange, extras, images],
	);
	const listedImages = useMemo(
		() => (extras ? extras.concat(images) : images),
		[extras, images],
	);

	useEffect(() => {
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
	}, []);

	// Reported when the list changes, to the handler passed last: a new handler alone is no
	// change, and an inline one that stores a derived list would otherwise render forever.
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;
	useEffect(() => {
		// The list is the server's only once loaded: before that, a field that has images
		// would report none, and after a failed load nothing is known.
		if (loading || loadError) return;
		onChangeRef.current?.(name, images);
	}, [images, loadError, loading, name]);

	if (loading || additionalImagesLoading) return <Loader />;
	if (loadError) return <span>{loadError.message}</span>;

	return (
		<>
			{error && <ErrorComponent error={error} />}
			<MultiImage
				{...otherProps}
				images={listedImages}
				onChange={handleChange}
			/>
		</>
	);
};

export default React.memo(CrudMultiImage);
