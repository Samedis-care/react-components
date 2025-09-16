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
import { ErrorComponentProps } from "../Form";
import { Loader } from "../../standalone";
import { FileSelectorError } from "../../standalone/FileUpload/Generic/Errors";

export interface CrudFileUploadProps
	extends Omit<FileUploadProps, "files" | "handleError"> {
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
		...otherProps
	} = props;
	const { allowDuplicates } = otherProps;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [loadError, setLoadError] = useState<Error | null>(null);
	const [files, setFiles] = useState<FileData<BackendFileMeta>[]>([]);

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
			// delete deleted files
			const deletePromise = connector.deleteMultiple(
				newFiles
					.filter((file) => file.delete)
					.map((file) => (file.file as BackendFileMeta).id),
			);

			try {
				// wait for response

				// deletePromise may be undefined or a promise

				await deletePromise;
				const uploadedFiles = await uploadPromise;

				const finalFiles = (
					newFiles.filter(
						(file) =>
							!file.delete &&
							!file.canBeUploaded &&
							"id" in (file.file as FileMeta | BackendFileMeta), // filter out additional files
					) as FileData<BackendFileMeta>[]
				).concat(uploadedFiles);

				// update state
				setFiles(finalFiles);
			} catch (e) {
				setError(e as Error);
			}
		},
		[allowDuplicates, connector, deserialize, files, serialize],
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
				onChange={handleChange}
				handleError={handleError}
				readOnly={otherProps.readOnly || connector == null}
			/>
		</>
	);
};

export default React.memo(React.forwardRef(CrudFileUpload));
