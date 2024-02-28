import { ModelFieldName, PageVisibility } from "../Model";
import { ApiConnector, Connector } from "./index";
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
    getNormal: ConnectorCallback<Connector<ModelFieldName, PageVisibility, unknown>> | null;
    /**
     * The default API backend connector
     */
    getApi: ConnectorCallback<ApiConnector<ModelFieldName, PageVisibility, unknown>> | null;
}
declare const DefaultConnector: DefaultConnectors;
/**
 * Set the default "normal" backend connector
 * @param def The new default
 */
export declare const setDefaultConnectorNormal: (def: ConnectorCallback<Connector<ModelFieldName, PageVisibility, unknown>>) => void;
/**
 * Set the default API AND "normal" backend connector
 * @param def The new default
 */
export declare const setDefaultConnectorAPI: (def: ConnectorCallback<ApiConnector<ModelFieldName, PageVisibility, unknown>>) => void;
export default DefaultConnector;
