import { Button, Grid } from "@material-ui/core";
import Field from "../../../backend-components/Form/Field";
import Model, { performanceTestDataCount } from "./Model";
import React from "react";
import { PageProps } from "../../../backend-components";
import { action } from "@storybook/addon-actions";

const SampleForm = (
	props: PageProps<keyof typeof Model["fields"], undefined>
) => (
	<Grid item xs={12} container spacing={2}>
		<Grid item xs={9} container spacing={2}>
			<Grid item xs={12}>
				<Field name={"username"} />
			</Grid>
			<Grid item xs={4}>
				<Field name={"first_name"} />
			</Grid>
			<Grid item xs={4}>
				<Field name={"middle_name"} />
			</Grid>
			<Grid item xs={4}>
				<Field name={"last_name"} />
			</Grid>
			<Grid item xs={12}>
				<Field name={"birthday"} />
			</Grid>
			<Grid item xs={3}>
				<Field name={"accept_tos"} />
			</Grid>
			<Grid item xs={3}>
				<Field name={"user_type"} />
			</Grid>
			<Grid item xs={6}>
				<Field name={"locale"} />
			</Grid>
			<Grid item xs={12}>
				<Field name={"notes"} />
			</Grid>
			<Grid item xs={12} md={6}>
				<Button
					type={"submit"}
					disabled={props.isSubmitting}
					variant={"outlined"}
					fullWidth
				>
					Save (via submit)
				</Button>
			</Grid>
			<Grid item xs={12} md={6}>
				<Button
					disabled={props.isSubmitting}
					variant={"outlined"}
					fullWidth
					onClick={async () => {
						try {
							await props.submit();
							action("submit")("Successfully submitted");
						} catch (e) {
							action("submit")("Error", e);
						}
					}}
				>
					Save (via code)
				</Button>
			</Grid>
			{new Array(performanceTestDataCount).fill(null).map((_, index) => (
				<Grid item xs={3} key={index.toString()}>
					<Field name={"perf_" + index.toString()} />
				</Grid>
			))}
		</Grid>
		<Grid item xs={3} container spacing={2}>
			<Grid item xs={12}>
				<Field name={"profile_picture"} />
			</Grid>
			<Grid item xs={12}>
				<Field name={"documents"} />
			</Grid>
		</Grid>
	</Grid>
);

export default React.memo(SampleForm);
