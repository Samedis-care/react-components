/**
 * Deep clones data
 * @param item The data to clone
 * @returns The cloned object
 */
const deepClone = (item) => {
    // source: https://stackoverflow.com/a/4460624 (license: CC BY-SA 4.0)
    // modified to work with TypeScript
    if (!item) {
        return item;
    } // null, undefined values check
    const types = [Number, String, Boolean];
    let result;
    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function (type) {
        if (item instanceof type) {
            result = type(item);
        }
    });
    if (item instanceof File) {
        result = new File([item], item.name, {
            type: item.type,
            lastModified: item.lastModified,
        });
    }
    if (typeof result == "undefined") {
        if (Array.isArray(item)) {
            result = [];
            item.forEach((child, index) => {
                result[index] = deepClone(child);
            });
        }
        else if (typeof item == "object") {
            // testing that this is DOM
            if ("nodeType" in item &&
                item.nodeType &&
                "cloneType" in item &&
                typeof item.cloneNode == "function") {
                result = item.cloneNode(true);
            }
            else if (!("prototype" in item) ||
                !item.prototype) {
                // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                }
                else {
                    // it is an object literal
                    result = {};
                    for (const i in item) {
                        result[i] = deepClone(item[i]);
                    }
                }
            }
            else {
                result = item;
            }
        }
        else {
            result = item;
        }
    }
    return result;
};
export default deepClone;
