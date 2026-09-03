import React, {
	ForwardedRef,
	RefAttributes,
	useCallback,
	useEffect,
	useMemo,
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

	// everything pending has been written, so nothing is a pending change any more
	useEffect(() => {
		if (!queueEmpty) return;
		setFiles((prev) =>
			prev.some((file) => file.changeState)
				? prev.map((file) =>
						file.changeState ? { ...file, changeState: undefined } : file,
					)
				: prev,
		);
	}, [queueEmpty]);

	const handleChange = useCallback(
		async (newFiles: FileData<File | FileMeta | BackendFileMeta>[]) => {
			if (!connector) return;

			// upload new/changed files
			const uploadPromise = Promise.all(
				newFiles
					.filter((file) => file.canBeUploaded)
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

			try {
				// wait for response

				// deletePromise may be undefined or a promise

				await deletePromise;
				const uploadedFiles = await uploadPromise;

				const kept = newFiles.filter(
					(file) =>
						!file.canBeUploaded &&
						"id" in (file.file as FileMeta | BackendFileMeta) && // filter out additional files
						(!file.delete ||
							(!!lazyConnector &&
								!cancelledUploads.has((file.file as BackendFileMeta).id))),
				) as FileData<BackendFileMeta>[];

				const finalFiles = kept
					.map((file) =>
						file.delete
							? {
									...file,
									// the delete has been handed to the connector, so the flag
									// is spent — leaving it set would queue the same delete
									// again on the next change. What is pending is recorded as
									// a change instead, and only where it can still be undone.
									delete: false,
									changeState: lazyConnector ? ("removed" as const) : undefined,
								}
							: file,
					)
					.concat(
						lazyConnector
							? uploadedFiles.map((file) => ({
									...file,
									changeState: "added" as const,
								}))
							: uploadedFiles,
					);

				// update state
				setFiles(finalFiles);
			} catch (e) {
				setError(e as Error);
			}
		},
		[allowDuplicates, connector, deserialize, files, lazyConnector, serialize],
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
				setFiles(initialFiles);
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
		() => (additionalFiles ? [...files, ...additionalFiles] : files),
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
