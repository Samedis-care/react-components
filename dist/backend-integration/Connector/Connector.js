/**
 * A generic backend connector which provides a basic CRUD interface for data
 */
class Connector {
    /**
     * Index function, which works with offsets, rather than pages
     * @see index
     * @remarks This should be implemented by application developers if possible, it allows for increased efficiency.
     *          This function should be avoided if you are developing Components-Care components, prefer the normal index function.
     *          This function is poly-filled if not implemented by application developer, which is less efficient
     *          and drops the user-defined third return value, as the polyfill merges multiple calls to index function into one.
     */
    async index2(params, model) {
        const pageSize = 25; // we call the main index function with this page size
        if (params.rows < 0)
            throw new Error("This function may only be called with params.rows >= 0");
        let page = (params.offset / pageSize) | 0;
        let offset = page * pageSize;
        let rows = params.rows;
        const mergedResultSet = [];
        let lastMeta = null;
        do {
            const [resultSet, meta] = await this.index(Object.assign({}, params, { page: page + 1, rows: pageSize }), model);
            lastMeta = meta;
            const maxRows = meta.filteredRows ?? meta.totalRows;
            const recordStartIndex = params.offset - offset;
            const recordEndIndex = Math.min(params.offset + params.rows, maxRows) - offset;
            const copySet = resultSet.slice(Math.max(recordStartIndex, 0), Math.min(recordEndIndex, pageSize));
            mergedResultSet.push(...copySet);
            if (offset + pageSize >= maxRows)
                break; // no more data
            // update vars
            page++;
            offset += pageSize;
            rows -= pageSize;
        } while (rows > 0);
        if (lastMeta == null)
            throw new Error("No metadata recorded");
        return [mergedResultSet, lastMeta];
    }
    async deleteMultiple(ids, model) {
        await Promise.all(ids.map((id) => Promise.resolve(this.delete(id, model))));
    }
    /**
     * Advanced deletion handler which supports delete all
     * @param req The deletion request
     * @protected
     */
    deleteAdvanced;
    /**
     * DataGrid exporters supported by this backend connector
     */
    dataGridExporters;
}
export default Connector;
