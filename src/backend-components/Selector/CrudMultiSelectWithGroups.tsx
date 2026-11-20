import React, { ForwardedRef, RefAttributes } from "react";
import { ModelRecord, ModelUnknown } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { BaseSelectorData, MultiSelectorData } from "../../standalone";
import BackendMultiSelectWithTags, {
	BackendMultiSelectWithTagsProps,
} from "./BackendMultiSelectWithTags";
import useCrudSelect, {
	CrudSelectDispatch,
	UseCrudSelectParams,
} from "./useCrudSelect";
import CrudSelectLoadState from "./CrudSelectLoadState";
import { DistributiveOmit } from "../../utils/internal/distributiveOmit";

export type CrudMultiSelectWithGroupsProps<
	GroupModelT extends ModelUnknown,
	DataModelT extends ModelUnknown,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData,
> = DistributiveOmit<
	BackendMultiSelectWithTagsProps<
		GroupModelT,
		DataModelT,
		GroupDataT,
		DataDataT
	>,
	| "selected"
	| "added"
	| "removed"
	| "onChange"
	| "convData"
	| "initialData"
	| "getIdOfData"
> &
	UseCrudSelectParams<DataModelT, DataDataT> & {
		/**
		 * The error component that is used to display errors
		 */
		errorComponent: React.ComponentType<ErrorComponentProps>;
		/**
		 * Get ID of data
		 */
		getIdOfData: NonNullable<
			BackendMultiSelectWithTagsProps<
				GroupModelT,
				DataModelT,
				GroupDataT,
				DataDataT
			>["getIdOfData"]
		>;
		/**
		 * Marks the title as modified (a dot after it) while picks, removals or changes of
		 * entries are queued and not saved yet
		 * @remarks Only with a LazyConnector, whose writes wait for the Form's save; any other
		 *          connector writes at once, and nothing is marked. An explicit `dirty` wins.
		 *          The entries' own marks ("Added", "Removed" with a restore button) do not
		 *          depend on it: they are shown with every LazyConnector.
		 * @default false
		 */
		showDirtyState?: boolean;
	};

const CrudMultiSelectWithGroups = <
	GroupModelT extends ModelUnknown,
	DataModelT extends ModelUnknown,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData,
>(
	props: CrudMultiSelectWithGroupsProps<
		GroupModelT,
		DataModelT,
		GroupDataT,
		DataDataT
	> &
		RefAttributes<CrudSelectDispatch<DataDataT>>,
	ref: ForwardedRef<CrudSelectDispatch<DataDataT>>,
) => {
	const { errorComponent: ErrorComponent } = props;

	const {
		loading,
		error,
		loadError,
		selected,
		added,
		removed,
		pendingChanges,
		initialRawData,
		handleSelect,
		modelToSelectorData,
	} = useCrudSelect(props, ref);
	// an explicit prop wins, as over the other states the field takes from its props
	const dirty =
		props.dirty ?? (props.showDirtyState ? pendingChanges : undefined);

	// until the selection is loaded nothing can be picked or removed
	const locked = loading || !!loadError;

	return (
		<>
			{error && <ErrorComponent error={error} />}
			<div aria-busy={loading}>
				<BackendMultiSelectWithTags<
					GroupModelT,
					DataModelT,
					GroupDataT,
					DataDataT
				>
					{...props}
					disabled={props.disabled || locked}
					selected={selected.map((entry) => entry.value)}
					added={added}
					removed={removed}
					dirty={dirty}
					onChange={handleSelect}
					convData={modelToSelectorData}
					// the connector's records seed the selected cache: modelToSelectorData tells them apart
					initialData={initialRawData as ModelRecord<DataModelT>[]}
				/>
			</div>
			<CrudSelectLoadState
				loading={loading}
				loadError={loadError}
				label={props.title}
			/>
		</>
	);
};

const ForwardedCrudMultiSelectWithGroups = React.forwardRef(
	CrudMultiSelectWithGroups,
) as <
	GroupModelT extends ModelUnknown,
	DataModelT extends ModelUnknown,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData,
>(
	props: CrudMultiSelectWithGroupsProps<
		GroupModelT,
		DataModelT,
		GroupDataT,
		DataDataT
	> &
		RefAttributes<CrudSelectDispatch<DataDataT>>,
) => React.ReactElement;

export default React.memo(
	ForwardedCrudMultiSelectWithGroups,
) as typeof ForwardedCrudMultiSelectWithGroups;
