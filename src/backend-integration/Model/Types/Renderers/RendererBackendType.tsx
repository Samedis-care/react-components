import React from "react";
import { ModelRenderParams } from "../../../index";
import Type from "../../Type";
import FilterType from "../../FilterType";

/**
 * No-op renderer
 */
class RendererBackendType<T> implements Type<T> {
	validate(): string | Promise<string | null> | null {
		return null;
	}
	getFilterType(): FilterType {
		return null;
	}
	getDefaultValue(): T {
		return null as unknown as T;
	}
	stringify(value: T): string {
		return JSON.stringify(value);
	}

	render(params: ModelRenderParams<T>): React.ReactElement {
		const { visibility } = params;

		if (visibility.disabled) return <></>;
		throw new Error("Not supported");
	}
}

export default RendererBackendType;
