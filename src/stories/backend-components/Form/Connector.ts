import { Connector } from "../../../backend-integration/Connector";
import {
	ModelFieldName,
	PageVisibility,
	ResponseMeta,
} from "../../../backend-integration";

class FormStoryConnector<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends Connector<KeyT, VisibilityT, CustomT> {
	create(): Promise<Record<KeyT, unknown>> {
		throw new Error("Unimplemented");
	}

	delete(): Promise<void> {
		throw new Error("Unimplemented");
	}

	index(): Promise<[Record<KeyT, unknown>[], ResponseMeta]> {
		throw new Error("Unimplemented");
	}

	read(): Promise<Record<KeyT, unknown>> {
		throw new Error("Unimplemented");
	}

	update(): Promise<Record<KeyT, unknown>> {
		throw new Error("Unimplemented");
	}
}

export default FormStoryConnector;
