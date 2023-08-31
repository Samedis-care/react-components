const DefaultConnector = {
    getNormal: null,
    getApi: null,
};
/**
 * Set the default "normal" backend connector
 * @param def The new default
 */
export const setDefaultConnectorNormal = (def) => {
    DefaultConnector.getNormal = def;
};
/**
 * Set the default API AND "normal" backend connector
 * @param def The new default
 */
export const setDefaultConnectorAPI = (def) => {
    DefaultConnector.getApi = def;
    DefaultConnector.getNormal = def;
};
export default DefaultConnector;
