import ApiConnector from "../../backend-integration/Connector/ApiConnector";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
export interface UseLazyCrudConnectorParams<ExtraT = undefined> {
    /**
     * The custom field name (must not be in model)
     */
    field: string;
    /**
     * Extra parameters to be passed to the getEndpoint function
     */
    extraParams?: ExtraT;
    /**
     * The backend endpoint to use
     */
    getEndpoint: (id: string) => string;
    /**
     * Callback for parent record id changes
     * @param id The parent record id
     */
    onParentIdChange?: (id: string) => void;
    /**
     * Creates an instance of the underlying connector
     * @param initialEndpoint The initial endpoint to use
     * @default defaults to DefaultConnector.api; will throw if not provided and this prop is not provided
     */
    getConnector?: (initialEndpoint: string, extraParams: ExtraT | undefined) => ApiConnector;
    /**
     * Callback to configure the connector after it got created by getConnector
     * @param connector The connector which was created by getConnector
     */
    configureConnector?: (connector: ApiConnector) => void;
    /**
     * The initial ID to use for getEndpoint
     */
    initialId: string | null;
}
export interface UseLazyCrudConnectorResult {
    connector: LazyConnector;
}
export declare const extractLazyCrudConnectorParams: <ExtraT, T extends UseLazyCrudConnectorParams<ExtraT>>(data: T) => [UseLazyCrudConnectorParams<ExtraT>, Omit<T, keyof UseLazyCrudConnectorParams<ExtraT>>];
declare const useLazyCrudConnector: <ExtraT = undefined>(params: UseLazyCrudConnectorParams<ExtraT>) => UseLazyCrudConnectorResult;
export default useLazyCrudConnector;
