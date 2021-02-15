import { Paper } from "@material-ui/core";
import React from "react";
import BaseSelector, {
	BaseSelectorData,
	BaseSelectorProps,
} from "./BaseSelector";
import { makeStyles } from "@material-ui/core/styles";
import { ClassNameMap } from "@material-ui/styles/withStyles";

const useStyles = makeStyles({
	wrapper: {
		marginTop: 16, // to accommodate InputLabel
	},
});

export interface SingleSelectorProps<DataT extends BaseSelectorData>
	extends Omit<BaseSelectorProps<DataT>, "classes"> {
	/**
	 * The custom CSS classes to be applied to this component
	 */
	classes?: Partial<ClassNameMap<keyof ReturnType<typeof useStyles>>>;
	/**
	 * The custom CSS classes to be forwarded to sub components
	 */
	subClasses?: {
		baseSelector: BaseSelectorProps<DataT>["classes"];
	};
}

const SingleSelect = <DataT extends BaseSelectorData>(
	props: SingleSelectorProps<DataT>
) => {
	const classes = useStyles(props);

	return (
		<Paper elevation={0} className={classes.wrapper}>
			<BaseSelector {...props} classes={props.subClasses?.baseSelector} />
		</Paper>
	);
};

export default React.memo(SingleSelect) as typeof SingleSelect;
