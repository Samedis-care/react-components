import Connector from "./Connector";
/**
 * Backend connector for APIs
 */
declare abstract class ApiConnector extends Connector {
    /**
     * Updates the API endpoint
     * @param url The API endpoint
     */
    abstract setApiEndpoint(url: string): void;
}
export default ApiConnector;
