import TypeString from "../../TypeString";
import RendererStringNullable from "./RendererStringNullable";
/**
 * Renders a text field
 */
class RendererString extends TypeString {
    props;
    // renders the same text field, a string is never null
    nullableRenderer;
    constructor(props) {
        super(props?.multiline);
        this.props = props;
        this.nullableRenderer = new RendererStringNullable(props);
    }
    render(params) {
        return this.nullableRenderer.render(params);
    }
}
export default RendererString;
