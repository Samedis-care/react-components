import { ModelFieldName, PageVisibility } from "../Model";
import { Connector } from "./index";

/**
 * Backend connector for APIs
 */
abstract class ApiConnector<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends Connector<KeyT, VisibilityT, CustomT> {
	/**
	 * Updates the API endpoint
	 * @param url The API endpoint
	 */
	abstract setApiEndpoint(url: string): void;
}

export default ApiConnector;
