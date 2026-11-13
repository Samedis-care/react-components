import React, { useCallback, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor, within } from "storybook/test";
import { Button, decomposeColor, getContrastRatio } from "@mui/material";
import { createMemoryHistory } from "history";
import { Framework } from "../../../framework";
import { setFrameworkHistory } from "../../../framework/History";
import Form, { PageProps, useFormContext } from "../Form";
import DefaultErrorComponent from "../DefaultErrorComponent";
import FormCrudMultiSelect from "./FormCrudMultiSelect";
import ApiConnector from "../../../backend-integration/Connector/ApiConnector";
import type { ResponseMeta } from "../../../backend-integration/Connector/Connector";
import type {
	ModelGetResponse,
	ModelRecord,
	ModelUnknown,
} from "../../../backend-integration";
import createTestModel from "../../../stories/test-utils/TestModel";
import type { MultiSelectorData } from "../../../standalone";

// a dirty form page blocks the history; keep that away from the Storybook frame's own
setFrameworkHistory(createMemoryHistory({ initialEntries: ["/page"] }));

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<div style={{ padding: 16, maxWidth: 480 }}>
			<Story />
		</div>
	</Framework>
);

const meta: Meta = {
	title: "Backend-Components/Form/FormCrudMultiSelect",
	decorators: [FrameworkDecorator],
	parameters: {
		docs: {
			description: {
				component:
					"`FormCrudMultiSelect` edits a sub-collection of the Form's record: the join records behind `getEndpoint(id)` (here the friends of person 1, `persons/1/friends`). It lists them, and picks and removals are queued (see `useLazyCrudConnector`): nothing is written until the Form is saved, then the queued requests go to the saved record's endpoint. A queued change makes the Form dirty. The request log under the field shows what the backend receives and when.",
			},
		},
	},
};

export default meta;

type Rows = Record<string, unknown>[];

/**
 * A friend as the selector holds it: value is the join record's id, person_id the id of
 * the picked person
 */
interface FriendData extends MultiSelectorData {
	person_id: string;
}

/**
 * The join collection behind one endpoint at a time (setApiEndpoint switches it), backed
 * by in-memory rows per endpoint; reports every request to the log
 */
class FriendConnector extends ApiConnector {
	private counter = 100;

	constructor(
		private endpoint: string,
		private stores: Record<string, Rows>,
		private log: (request: string) => void,
	) {
		super();
	}

	setApiEndpoint(url: string): void {
		this.endpoint = url;
	}

	index(): Promise<[Rows, ResponseMeta]> {
		this.log(`GET ${this.endpoint}`);
		const rows = this.stores[this.endpoint] ?? [];
		return Promise.resolve([
			rows.map((row) => ({ ...row })),
			{ totalRows: rows.length, filteredRows: rows.length },
		]);
	}

	create(
		data: Record<string, unknown>,
	): Promise<ModelGetResponse<ModelUnknown>> {
		this.log(`POST ${this.endpoint} (person ${data.person_id as string})`);
		const record = { ...data, id: String(this.counter++) };
		(this.stores[this.endpoint] ??= []).push(record);
		return Promise.resolve([record, {}]);
	}

	read(id: string): Promise<ModelGetResponse<ModelUnknown>> {
		return Promise.resolve([{ id }, {}]);
	}

	update(
		data: Record<string, unknown>,
	): Promise<ModelGetResponse<ModelUnknown>> {
		this.log(`PUT ${this.endpoint}/${data.id as string}`);
		return Promise.resolve([data, {}]);
	}

	delete(id: string): Promise<void> {
		this.log(`DELETE ${this.endpoint}/${id}`);
		this.stores[this.endpoint] = (this.stores[this.endpoint] ?? []).filter(
			(row) => row.id !== id,
		);
		return Promise.resolve();
	}
}

const getEndpoint = (id: string) => `persons/${id}/friends`;
// a new entry's value is "to-create-…": leave it out, the backend assigns the id
const serialize = (data: FriendData) => ({
	id: data.value.startsWith("to-create-") ? undefined : data.value,
	person_id: data.person_id,
	label: data.label,
});
const deserialize = (record: Record<string, unknown>): FriendData => ({
	value: record.id as string,
	label: record.label as string,
	person_id: record.person_id as string,
});
const deserializeModel = (record: ModelRecord<PeopleModel>) => ({
	label: `${record.first_name} ${record.last_name}`,
	person_id: record.id,
});
const getIdOfData = (data: FriendData) => data.person_id;

type PeopleModel = ReturnType<typeof createTestModel>;

interface StoryCustomProps {
	getConnector: (endpoint: string) => FriendConnector;
	log: string[];
}

/**
 * The form page: the friends selector, the form's dirty state, Save, and the request log
 */
const FriendsPage = (props: PageProps<PeopleModel, StoryCustomProps>) => {
	const { getConnector, log } = props.customProps;
	const { id, model, dirty, submit } = useFormContext<PeopleModel>();
	const handleSave = useCallback(() => {
		// a failed save is shown by the form's error dialog
		submit().catch(() => {});
	}, [submit]);
	return (
		<>
			<FormCrudMultiSelect<PeopleModel, FriendData>
				model={model}
				field={"friends_crud"}
				initialId={id}
				getEndpoint={getEndpoint}
				getConnector={getConnector}
				serialize={serialize}
				deserialize={deserialize}
				deserializeModel={deserializeModel}
				getIdOfData={getIdOfData}
				label={"Friends"}
				placeholder={"Search people"}
				searchDebounceTime={0}
			/>
			<p>
				Unsaved changes:{" "}
				<span data-testid={"dirty"}>{dirty ? "yes" : "no"}</span>
			</p>
			<Button type={"button"} variant={"contained"} onClick={handleSave}>
				Save
			</Button>
			<p>Requests sent:</p>
			<ol data-testid={"requests"}>
				{log.map((request, index) => (
					<li key={index}>{request}</li>
				))}
			</ol>
		</>
	);
};

interface FriendsFormProps {
	/**
	 * The person whose friends are edited; null for a new person
	 */
	id: string | null;
	/**
	 * The friends (join rows) person 1 has on the server
	 */
	friends: Rows;
	readOnly?: boolean;
}

const FriendsForm = (props: FriendsFormProps) => {
	const { id, friends, readOnly } = props;
	const model = useMemo(createTestModel, []);
	const [log, setLog] = useState<string[]>([]);
	const getConnector = useMemo(() => {
		// a copy: the connector writes to it
		const stores: Record<string, Rows> = {
			[getEndpoint("1")]: friends.map((row) => ({ ...row })),
		};
		const append = (request: string) => setLog((prev) => [...prev, request]);
		return (endpoint: string) => new FriendConnector(endpoint, stores, append);
	}, [friends]);
	const customProps = useMemo(
		(): StoryCustomProps => ({ getConnector, log }),
		[getConnector, log],
	);
	return (
		<Form
			model={model}
			id={id}
			errorComponent={DefaultErrorComponent}
			customProps={customProps}
			disableRouting
			readOnly={readOnly}
		>
			{FriendsPage}
		</Form>
	);
};

const CAROL: Rows = [{ id: "100", person_id: "3", label: "Carol Jones" }];

/**
 * Mixes a CSS color with an alpha channel over white, the background of the stories
 */
const overWhite = (color: string) => {
	const [r, g, b, a = 1] = decomposeColor(color).values;
	const over = (channel: number) => Math.round(channel * a + 255 * (1 - a));
	return `rgb(${over(r)}, ${over(g)}, ${over(b)})`;
};

/**
 * ISSUE-3505-ITEM-16: in a read-only Form the field shows its entries read-only, as the
 * read-only file upload does: the label and the entries, without a search field or remove
 * buttons, and nothing disabled. Label and entries keep the contrast of an editable field
 * (at least 4.5:1).
 */
export const Issue3505Item16ReadOnlyFieldIsReadOnly: StoryObj = {
	parameters: { a11y: { test: "error" } },
	render: () => <FriendsForm id={"1"} friends={CAROL} readOnly />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const list = await canvas.findByRole(
			"list",
			{ name: "Friends" },
			{ timeout: 5000 },
		);
		const entry = within(list).getByText("Carol Jones");

		await expect(canvas.queryByRole("combobox")).toBeNull();
		await expect(canvas.queryByRole("button", { name: /^Remove/ })).toBeNull();
		await expect(
			canvasElement.querySelector(":disabled, .Mui-disabled"),
		).toBeNull();
		for (const text of [canvas.getByText("Friends"), entry]) {
			await expect(
				getContrastRatio(overWhite(getComputedStyle(text).color), "#fff"),
			).toBeGreaterThanOrEqual(4.5);
		}
	},
};

/**
 * ISSUE-3505-ITEM-16: a save leaves the search field as it is: the focus and the text typed
 * into it stay, through the save and after it.
 */
export const Issue3505Item16SaveKeepsSearchFocusAndText: StoryObj = {
	parameters: { a11y: { test: "error" } },
	render: () => <FriendsForm id={"1"} friends={CAROL} />,
	play: async ({ canvasElement, userEvent }) => {
		const canvas = within(canvasElement);
		await canvas.findByText("Carol Jones", {}, { timeout: 5000 });
		// a removal gives the save something to send
		await userEvent.click(
			canvas.getByRole("button", { name: "Remove Carol Jones" }),
		);
		await waitFor(() =>
			expect(canvas.getByTestId("dirty")).toHaveTextContent("yes"),
		);
		const input = canvas.getByRole("combobox", { name: "Friends" });
		await userEvent.click(input);
		await userEvent.keyboard("Ca");
		await expect(input).toHaveValue("Ca");

		// starts the save and leaves the focus where it is, as FormAutoSave does
		canvas.getByRole("button", { name: "Save" }).click();
		await waitFor(() =>
			expect(canvas.getByTestId("dirty")).toHaveTextContent("no"),
		);
		await expect(
			Array.from(
				canvas.getByTestId("requests").querySelectorAll("li"),
				(item) => item.textContent,
			),
		).toEqual(["GET persons/1/friends", "DELETE persons/1/friends/100"]);

		await expect(input).toHaveFocus();
		await expect(input).toHaveValue("Ca");
	},
};
