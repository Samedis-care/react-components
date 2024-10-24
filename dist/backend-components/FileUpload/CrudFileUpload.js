import React, { useCallback, useEffect, useState, } from "react";
import FileUpload from "../../standalone/FileUpload/Generic";
import { Loader } from "../../standalone";
const CrudFileUpload = (props, ref) => {
    const { connector, serialize, deserialize, onChange, ...otherProps } = props;
    const { allowDuplicates } = otherProps;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [files, setFiles] = useState([]);
    const handleChange = useCallback(async (newFiles) => {
        if (!connector)
            return;
        // upload new/changed files
        const uploadPromise = Promise.all(newFiles
            .filter((file) => file.canBeUploaded)
            .map(async (file) => {
            // check if we have to replace a file (update)
            if (allowDuplicates) {
                const oldFile = files.find((oldFile) => oldFile.file.name === file.file.name);
                if (oldFile) {
                    return connector.update(await serialize(file, oldFile.file.id));
                }
            }
            // or create new
            return connector.create(await serialize(file, null));
        })
            .map(async (request) => deserialize((await request)[0])));
        // delete deleted files
        const deletePromise = connector.deleteMultiple(newFiles
            .filter((file) => file.delete)
            .map((file) => file.file.id));
        try {
            // wait for response
            // deletePromise may be undefined or a promise
            await deletePromise;
            const uploadedFiles = await uploadPromise;
            const finalFiles = newFiles.filter((file) => !file.delete && !file.canBeUploaded).concat(uploadedFiles);
            // update state
            setFiles(finalFiles);
        }
        catch (e) {
            setError(e);
        }
    }, [allowDuplicates, connector, deserialize, files, serialize]);
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
                const initialFiles = await Promise.all(initialData[0].map(deserialize));
                setFiles(initialFiles);
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
    useEffect(() => {
        if (onChange)
            onChange(files);
    }, [files, onChange]);
    if (loading)
        return React.createElement(Loader, null);
    if (loadError)
        return React.createElement("span", null, loadError.message);
    const ErrorComponent = props.errorComponent;
    return (React.createElement(React.Fragment, null,
        error && React.createElement(ErrorComponent, { error: error }),
        React.createElement(FileUpload, { ...otherProps, ref: ref, files: files, onChange: handleChange, handleError: handleError, readOnly: otherProps.readOnly || connector == null })));
};
export default React.memo(React.forwardRef(CrudFileUpload));
