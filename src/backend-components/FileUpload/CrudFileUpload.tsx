import React, {
	ForwardedRef,
	RefAttributes,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import FileUpload, {
	FileData,
	FileMeta,
	FileUploadDispatch,
	FileUploadProps,
} from "../../standalone/FileUpload/Generic";
import { Connector, PageVisibility } from "../../backend-integration";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import { ErrorComponentProps } from "../Form";
import { Loader } from "../../standalone";
import { FileSelectorError } from "../../standalone/FileUpload/Generic/Errors";

export interface CrudFileUploadProps extends Omit<
	FileUploadProps,
	"files" | "handleError"
> {
	/**
	 * The backend connector used as CRUD interface
	 * @remarks Passing null will render an readOnly control
	 */
	connector: Connector<string, PageVisibility, unknown> | null;
	/**
	 * The error component that is used to display errors
	 */
	errorComponent: React.ComponentType<ErrorComponentProps>;
	/**
	 * Callback for serializing data before passing it to the backend connector
	 * @param data The file data to serialize
	 * @param id The file id or null if upload new
	 * @returns Data to be passed to the backend connector
	 */
	serialize: (
		data: FileData<File>,
		id: string | null,
	) => Promise<Record<string, unknown>> | Record<string, unknown>;
	/**
	 * Callback for deserializing data after getting it from the backend connector
	 * @param data The data from the backend connector (index function)
	 * @returns The file data which can be used by the control
	 */
	deserialize: (
		data: Record<string, unknown>,
	) => Promise<FileData<BackendFileMeta>> | FileData<BackendFileMeta>;
	/**
	 * additional read-only files
	 */
	additionalFiles?: FileData<FileMeta>[];
	/**
	 * Mark the control as modified while file changes are queued
	 * @remarks Off by default, like `FormProps.showDirtyState`. An explicit `dirty` prop
	 *          wins over it, and it shows nothing without a LazyConnector, where a change
	 *          is written before this control hears about it.
	 */
	showDirtyState?: boolean;
	/**
	 * Called with the current state on mount, and whenever queued file changes appear or
	 * are written
	 * @param dirty Are file changes waiting to be written?
	 * @remarks Independent of showDirtyState — pending changes are state, not display —
	 *          and always false without a LazyConnector. Memoize the handler.
	 */
	onDirtyChange?: (dirty: boolean) => void;
}

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

const isAdditionalFile = (
	file: FileData<File | FileMeta | BackendFileMeta>,
): boolean => ADDITIONAL_FILE in file;

export interface BackendFileMeta extends FileMeta {
	/**
	 * The ID of the file in backend
	 */
	id: string;
}

const CrudFileUpload = (
	props: CrudFileUploadProps & RefAttributes<FileUploadDispatch>,
	ref: ForwardedRef<FileUploadDispatch>,
) => {
	const {
		connector,
		serialize,
		deserialize,
		onChange,
		additionalFiles,
		showDirtyState,
		onDirtyChange,
		...otherProps
	} = props;
	const { allowDuplicates } = otherProps;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [loadError, setLoadError] = useState<Error | null>(null);
	const [files, setFiles] = useState<FileData<BackendFileMeta>[]>([]);
	// Only a queued write can be shown as pending and undone. A direct connector has
	// already created or deleted the file by the time this returns, so there is nothing
	// to mark and a restore button would be a lie.
	const lazyConnector = connector instanceof LazyConnector ? connector : null;
	// Whether anything is still waiting to be written. The queue is not React state, so
	// working it at submit or cancelling an entry changes nothing React watches — this
	// is the one thing worth mirroring out of it, and it drives both the dirty flag and
	// the clearing of the per-file marks below.
	const [queueEmpty, setQueueEmpty] = useState(
		() => lazyConnector?.isQueueEmpty() ?? true,
	);
	useEffect(() => {
		if (!lazyConnector) return;
		setQueueEmpty(lazyConnector.isQueueEmpty());
		return lazyConnector.addQueueChangeListener((queue) => {
			setQueueEmpty(queue.length === 0);
		});
	}, [lazyConnector]);

	// Everything pending has been written: an added file is now simply a file, and a
	// removed one is gone from the server, so it leaves the list rather than losing its
	// mark. Left in place it reads as an existing file, and removing it a second time
	// sends the same delete against an id the backend no longer knows.
	useEffect(() => {
		if (!queueEmpty) return;
		setFiles((prev) =>
			prev.some((file) => file.changeState)
				? prev
						.filter((file) => file.changeState !== "removed")
						.map((file) =>
							file.changeState ? { ...file, changeState: undefined } : file,
						)
				: prev,
		);
	}, [queueEmpty]);

	// What each picked file became once it was uploaded. The list handed to handleChange
	// comes from the standalone control, which keeps its own copy of a picked file until
	// our result reaches it — so a change made before that, removing another file while
	// the upload is still running, hands the picked file back unchanged. Uploading it
	// again would put a second copy on the server.
	const uploadedPicks = useRef(new WeakMap<File, FileData<BackendFileMeta>>());
	// ...which only helps if the upload that fills it has finished, so changes are
	// applied one after the other rather than side by side
	const pendingChange = useRef<Promise<unknown>>(Promise.resolve());

	const applyChange = useCallback(
		async (newFiles: FileData<File | FileMeta | BackendFileMeta>[]) => {
			if (!connector) return;
			newFiles = newFiles.map(
				(file) =>
					(file.canBeUploaded
						? uploadedPicks.current.get(file.file as File)
						: null) ?? file,
			);

			// upload new/changed files
			const picked = newFiles.filter((file) => file.canBeUploaded);
			const uploads = Promise.allSettled(
				picked
					.map(async (file) => {
						// check if we have to replace a file (update)
						if (allowDuplicates) {
							const oldFile = files.find(
								(oldFile) => oldFile.file.name === file.file.name,
							);
							if (oldFile) {
								return connector.update(
									await serialize(file as FileData<File>, oldFile.file.id),
								);
							}
						}
						// or create new
						return connector.create(
							await serialize(file as FileData<File>, null),
						);
					})
					.map(async (request) => deserialize((await request)[0])),
			);
			const deletedIds = newFiles
				.filter((file) => file.delete)
				.map((file) => (file.file as BackendFileMeta).id);
			// A file whose upload is only queued has nothing on the server: removing it
			// cancels that upload, so it leaves the list rather than being shown as
			// removed.
			const cancelledUploads = new Set(
				newFiles
					.filter((file) => file.delete && file.changeState === "added")
					.map((file) => (file.file as BackendFileMeta).id),
			);
			// delete deleted files
			const deletePromise = connector.deleteMultiple(deletedIds);

			// Every write is accounted for on its own, rather than the first failure
			// taking the rest with it. The list comes back from the standalone control
			// with the picked files still in it, so an upload which went through but was
			// not recorded here is sent again by the next change, leaving a second copy
			// on the server.
			let error: Error | null = null;
			// deletePromise may be undefined or a promise
			const deleted = await Promise.resolve(deletePromise).then(
				() => true,
				(e: Error) => {
					error = e;
					return false;
				},
			);
			// What the connector queue says is pending for a file, rather than what the
			// list this change started with said. A change is applied a moment after it
			// was made, and the queue may have moved on in between — a change which
			// cancels the last queued write lands after the state which cleared the
			// marks, and would otherwise put the stale one back.
			const markOf = (id: string) => {
				const queued = lazyConnector?.getQueuedOperation(id);
				return queued === "create"
					? ("added" as const)
					: queued === "delete"
						? ("removed" as const)
						: undefined;
			};
			const uploadedFiles: FileData<BackendFileMeta>[] = [];
			(await uploads).forEach((result, index) => {
				if (result.status === "rejected") {
					error = error ?? (result.reason as Error);
					return;
				}
				// canBeUploaded is what makes it a File, per FileData's own contract
				uploadedPicks.current.set(picked[index].file as File, result.value);
				uploadedFiles.push(result.value);
			});
			if (error) setError(error);

			const kept = newFiles.filter(
				(file) =>
					!file.canBeUploaded &&
					// the list handed back includes what was only passed through for
					// display, which this control neither stores nor writes
					!isAdditionalFile(file) &&
					"id" in (file.file as FileMeta | BackendFileMeta) &&
					// a delete the server refused has not happened: the file stays in the
					// list, still marked, for the next change to try again
					(!file.delete ||
						!deleted ||
						(!!lazyConnector &&
							!cancelledUploads.has((file.file as BackendFileMeta).id))),
			) as FileData<BackendFileMeta>[];

			const finalFiles = kept
				.map((file): FileData<BackendFileMeta> => ({
					...file,
					// the delete has been handed to the connector, so the flag is spent —
					// leaving it set would queue the same delete again on the next change.
					// One the server refused has not happened, and stays set so that the
					// next change tries it again.
					delete: !!file.delete && !deleted,
					changeState: markOf(file.file.id),
				}))
				.concat(
					uploadedFiles.map((file) => ({
						...file,
						changeState: markOf(file.file.id),
					})),
				);

			// update state
			setFiles(finalFiles);
		},
		[allowDuplicates, connector, deserialize, files, lazyConnector, serialize],
	);

	/**
	 * Applies one change from the control, after every change before it
	 * @remarks The standalone control fires a change per interaction, without waiting for
	 *          what the last one did. Running them in order is what lets each see the
	 *          uploads the ones before it made.
	 */
	const handleChange = useCallback(
		(newFiles: FileData<File | FileMeta | BackendFileMeta>[]) => {
			const change = pendingChange.current.then(() => applyChange(newFiles));
			// a failed change must not stop the ones after it
			pendingChange.current = change.catch(() => undefined);
			return change;
		},
		[applyChange],
	);

	// A CrudFileUpload is a custom form field: it is not in the model, so the form has no
	// per-field dirty state for it and nothing hands it `dirty`. With a lazy connector it
	// does not need one — a queued write *is* the pending change, which is the same thing
	// useLazyCrudConnector reports through setCustomFieldDirty.
	const pendingChanges = lazyConnector ? !queueEmpty : false;
	// an explicit prop wins, as it does over every other derived state here
	const dirty =
		otherProps.dirty ?? (showDirtyState ? pendingChanges : undefined);
	// state, not display: this reports the pending changes whether or not they are marked
	useEffect(() => {
		if (!onDirtyChange) return;
		onDirtyChange(pendingChanges);
	}, [onDirtyChange, pendingChanges]);

	const handleRestore = useCallback(
		(file: FileData) => {
			if (!lazyConnector) return;
			const id = (file.file as BackendFileMeta).id;
			lazyConnector.cancelQueuedOperation(id);
			// by id, not by identity: the control keeps its own copies of the entries
			setFiles((prev) =>
				prev.map((entry) =>
					entry.file.id === id ? { ...entry, changeState: undefined } : entry,
				),
			);
		},
		[lazyConnector],
	);

	const handleError = useCallback((_: FileSelectorError, msg: string) => {
		setError(new Error(msg));
	}, []);

	useEffect(() => {
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
				// A pending change outlives this control: the queue sits on the connector,
				// so a control which was unmounted and mounted again — a language switch,
				// a route change — reads its marks back off it instead of starting blank.
				// A queued upload is in the index result already, a queued removal is not:
				// index hides it, and hands it back here.
				const removedFiles = lazyConnector
					? await Promise.all(
							lazyConnector
								.getQueuedDeleteRecords()
								.map((value) => Promise.resolve(deserialize(value))),
						)
					: [];
				setFiles([
					...initialFiles.map((file) =>
						lazyConnector?.getQueuedOperation(file.file.id) === "create"
							? { ...file, changeState: "added" as const }
							: file,
					),
					// at the end rather than where the backend had them: what index
					// hands back carries no position
					...removedFiles.map((file) => ({
						...file,
						changeState: "removed" as const,
					})),
				]);
			} catch (e) {
				setLoadError(e as Error);
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connector]);

	useEffect(() => {
		if (onChange) onChange(files);
	}, [files, onChange]);

	const finalFiles = useMemo(
		() =>
			additionalFiles
				? [
						...files,
						...additionalFiles.map((file) => ({
							...file,
							// read-only as documented: they are not this control's records,
							// so a remove would send a delete for an id which means
							// something else entirely to this connector
							preventDelete: true,
							[ADDITIONAL_FILE]: true,
						})),
					]
				: files,
		[files, additionalFiles],
	);

	if (loading) return <Loader />;
	if (loadError) return <span>{loadError.message}</span>;

	const ErrorComponent = props.errorComponent;

	return (
		<>
			{error && <ErrorComponent error={error} />}
			<FileUpload
				{...otherProps}
				ref={ref}
				files={finalFiles}
				dirty={dirty}
				onChange={handleChange}
				onRestoreFile={lazyConnector ? handleRestore : undefined}
				handleError={handleError}
				readOnly={otherProps.readOnly || connector == null}
			/>
		</>
	);
};

export default React.memo(React.forwardRef(CrudFileUpload));
