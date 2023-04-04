import { Connector } from "../../../backend-integration/Connector";
import { ModelFieldName, ModelGetResponse, PageVisibility, ResponseMeta } from "../../../backend-integration";
declare class FormStoryConnector<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> extends Connector<KeyT, VisibilityT, CustomT> {
    create(): ModelGetResponse<KeyT>;
    delete(): Promise<void>;
    index(): Promise<[Record<string, unknown>[], ResponseMeta]>;
    read(): ModelGetResponse<string>;
    update(): ModelGetResponse<string>;
}
export default FormStoryConnector;
