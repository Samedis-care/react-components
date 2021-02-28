import React, { useCallback, useEffect, useState } from "react";
import FileUpload, {
	FileData,
	FileMeta,
	FileUploadProps,
} from "../../standalone/FileUpload/Generic";
import { Connector, PageVisibility } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import ErrorComponent from "../../stories/backend-components/Form/ErrorComponent";
import { Loader } from "../../standalone";

export interface CrudFileUploadProps
	extends Omit<FileUploadProps, "files" | "handleError" | "classes"> {
	/**
	 * The backend connector used as CRUD interface
	 */
	connector: Connector<string, PageVisibility, unknown>;
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
		id: string | null
	) => Promise<Record<string, unknown>> | Record<string, unknown>;
	/**
	 * Callback for deserializing data after getting it from the backend connector
	 * @param data The data from the backend connector (index function)
	 * @returns The file data which can be used by the control
	 */
	deserialize: (
		data: Record<string, unknown>
	) => Promise<FileData<BackendFileMeta>> | FileData<BackendFileMeta>;
	/**
	 * Custom CSS classes for styling
	 */
	classes?: FileUploadProps["classes"];
}

export interface BackendFileMeta extends FileMeta {
	/**
	 * The ID of the file in backend
	 */
	id: string;
}

const CrudFileUpload = (props: CrudFileUploadProps) => {
	const { connector, serialize, deserialize, onChange, ...otherProps } = props;
	const { allowDuplicates } = otherProps;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [loadError, setLoadError] = useState<Error | null>(null);
	const [files, setFiles] = useState<FileData<BackendFileMeta>[]>([]);

	const handleChange = useCallback(
		async (newFiles: FileData[]) => {
			// upload new/changed files
			const uploadPromise = Promise.all(
				newFiles
					.filter((file) => file.canBeUploaded)
					.map(async (file) => {
						// check if we have to replace a file (update)
						if (allowDuplicates) {
							const oldFile = files.find(
								(oldFile) => oldFile.file.name === file.file.name
							);
							if (oldFile) {
								return connector.update(
									await serialize(file as FileData<File>, oldFile.file.id)
								);
							}
						}
						// or create new
						return connector.create(
							await serialize(file as FileData<File>, null)
						);
					})
					.map(async (request) => deserialize((await request)[0]))
			);
			// delete deleted files
			const deletePromise = connector.deleteMultiple(
				newFiles
					.filter((file) => file.delete)
					.map((file) => (file.file as BackendFileMeta).id)
			);

			try {
				// wait for response
				await deletePromise;
				const uploadedFiles = await uploadPromise;

				const finalFiles = (newFiles.filter(
					(file) => !file.delete && !file.canBeUploaded
				) as FileData<BackendFileMeta>[]).concat(uploadedFiles);

				// update state
				setFiles(finalFiles);
				if (onChange) onChange(finalFiles);
			} catch (e) {
				setError(e as Error);
			}
		},
		[allowDuplicates, connector, deserialize, files, onChange, serialize]
	);

	const handleError = useCallback((_, msg: string) => {
		setError(new Error(msg));
	}, []);

	useEffect(() => {
		void (async () => {
			try {
				const initialData = await connector.index({
					page: 1,
					rows: Number.MAX_SAFE_INTEGER,
				});
				const initialFiles = await Promise.all(initialData[0].map(deserialize));
				setFiles(initialFiles);
			} catch (e) {
				setLoadError(e as Error);
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (loading) return <Loader />;
	if (loadError) return <span>{loadError.message}</span>;

	return (
		<>
			{error && <ErrorComponent error={error} />}
			<FileUpload
				{...otherProps}
				files={files}
				onChange={handleChange}
				handleError={handleError}
			/>
		</>
	);
};

export default React.memo(CrudFileUpload);
