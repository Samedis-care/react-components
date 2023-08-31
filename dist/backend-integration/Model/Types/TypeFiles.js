import { fileToData } from "../../../utils";
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
    serialize = async (files) => {
        return await Promise.all(files.map(async (file) => ({
            ...file,
            file: {
                name: file.file.name,
            },
            preview: file.preview,
            data: file.canBeUploaded &&
                (this.params?.alwaysSendRawData || !file.preview)
                ? await fileToData(file.file)
                : undefined,
        })));
    };
    stringify(values) {
        return values.map((value) => value.file.name).join(", ");
    }
}
export default TypeFiles;
