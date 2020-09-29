import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { FileData } from "../../../standalone/FileUpload/Generic";

abstract class TypeFiles implements Type<FileData[]> {
	abstract render(params: ModelRenderParams<FileData[]>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return null;
	}

	getDefaultValue(): FileData[] {
		return [];
	}
}

export default TypeFiles;
