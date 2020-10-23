import { Connector } from "../../../backend-integration/Connector";
import { ModelFieldName } from "../../../backend-integration/Model";
import { ResponseMeta } from "../../../backend-integration/Connector";

class FormStoryConnector<KeyT extends ModelFieldName> extends Connector<KeyT> {
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
