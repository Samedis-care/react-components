import React from "react";
import { ModelRenderParams } from "../../../index";
import TypeStringArray from "../TypeStringArray";

/**
 * No-op renderer for string array type
 */
class RendererBackendStringArray extends TypeStringArray {
	render(params: ModelRenderParams<string[]>): React.ReactElement {
		const { visibility, field, value } = params;

		if (visibility.disabled) return <></>;
		if (visibility.hidden) {
			return (
				<input
					type="hidden"
					name={field}
					value={value?.join(",") ?? ""}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		throw new Error("Not supported");
	}
}

export default RendererBackendStringArray;
