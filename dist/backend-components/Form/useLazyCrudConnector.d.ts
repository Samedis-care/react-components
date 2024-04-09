import { ModelFieldName, PageVisibility } from "../../backend-integration/Model/Model";
import ApiConnector from "../../backend-integration/Connector/ApiConnector";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
export interface UseLazyCrudConnectorParams<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, ExtraT = undefined> {
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
    getConnector?: (initialEndpoint: string, extraParams: ExtraT | undefined) => ApiConnector<KeyT, VisibilityT, CustomT>;
    /**
     * Callback to configure the connector after it got created by getConnector
     * @param connector The connector which was created by getConnector
     */
    configureConnector?: (connector: ApiConnector<KeyT, VisibilityT, CustomT>) => void;
    /**
     * The initial ID to use for getEndpoint
     */
    initialId: string | null;
}
export interface UseLazyCrudConnectorResult<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> {
    connector: LazyConnector<KeyT, VisibilityT, CustomT>;
}
export declare const extractLazyCrudConnectorParams: <KeyT extends string, VisibilityT extends PageVisibility, CustomT, ExtraT, T extends UseLazyCrudConnectorParams<KeyT, VisibilityT, CustomT, ExtraT>>(data: T) => [
    UseLazyCrudConnectorParams<KeyT, VisibilityT, CustomT, ExtraT>,
    Omit<T, keyof UseLazyCrudConnectorParams<KeyT, VisibilityT, CustomT, ExtraT>>
];
declare const useLazyCrudConnector: <KeyT extends string, VisibilityT extends PageVisibility, CustomT, ExtraT = undefined>(params: UseLazyCrudConnectorParams<KeyT, VisibilityT, CustomT, ExtraT>) => UseLazyCrudConnectorResult<KeyT, VisibilityT, CustomT>;
export default useLazyCrudConnector;
