import Connector from "./Connector";
import ApiConnector from "./ApiConnector";
/**
 * Callback to get connector instance
 * @param endpoint The endpoint the connector
 * @param extraParams Extra parameters passed though
 */
export type ConnectorCallback<T> = (endpoint: string, extraParams: Record<string, unknown> | undefined) => T;
export interface DefaultConnectors {
    /**
     * The default "normal" backend connector
     */
    getNormal: ConnectorCallback<Connector> | null;
    /**
     * The default API backend connector
     */
    getApi: ConnectorCallback<ApiConnector> | null;
}
declare const DefaultConnector: DefaultConnectors;
/**
 * Set the default "normal" backend connector
 * @param def The new default
 */
export declare const setDefaultConnectorNormal: (def: ConnectorCallback<Connector>) => void;
/**
 * Set the default API AND "normal" backend connector
 * @param def The new default
 */
export declare const setDefaultConnectorAPI: (def: ConnectorCallback<ApiConnector>) => void;
export default DefaultConnector;
