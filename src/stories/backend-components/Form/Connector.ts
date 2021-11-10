import { Connector } from "../../../backend-integration/Connector";
import {
	ModelFieldName,
	ModelGetResponse,
	PageVisibility,
	ResponseMeta,
} from "../../../backend-integration";

class FormStoryConnector<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends Connector<KeyT, VisibilityT, CustomT> {
	create(): ModelGetResponse<KeyT> {
		throw new Error("Unimplemented");
	}

	delete(): Promise<void> {
		throw new Error("Unimplemented");
	}

	index(): Promise<[Record<string, unknown>[], ResponseMeta]> {
		throw new Error("Unimplemented");
	}

	read(): ModelGetResponse<string> {
		throw new Error("Unimplemented");
	}

	update(): ModelGetResponse<string> {
		throw new Error("Unimplemented");
	}
}

export default FormStoryConnector;
