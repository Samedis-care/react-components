/**
 * A type to handle files
 */
class TypeFiles {
    params;
    constructor(params) {
        this.params = params;
    }
    validate() {
        return null;
    }
    getFilterType() {
        return null;
    }
    getDefaultValue() {
        return [];
    }
    /**
     * @remarks The files stay Blobs, the API client decides how to send them. An array of
     *          objects cannot be sent as Rails multipart, so RailsApiClient sends this as
     *          JSON with the files as data URIs.
     */
    serialize = (files) => files.map((file) => ({
        ...file,
        file: {
            name: file.file.name,
            type: file.file.type,
        },
        preview: file.preview,
        data: file.canBeUploaded && (this.params?.alwaysSendRawData || !file.preview)
            ? file.file
            : undefined,
    }));
    stringify(values) {
        return values.map((value) => value.file.name).join(", ");
    }
}
export default TypeFiles;
