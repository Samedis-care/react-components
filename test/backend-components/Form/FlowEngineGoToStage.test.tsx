import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import {
	render,
	screen,
	cleanup,
	fireEvent,
	waitFor,
} from "@testing-library/react";
import FlowEngine, {
	FlowStageProps,
} from "../../../src/backend-components/Form/FlowEngine/FlowEngine";
import { PageProps } from "../../../src/backend-components/Form/Form";
import { ModelUnknown } from "../../../src/backend-integration";

const submit = vi.hoisted(() => vi.fn(() => Promise.resolve()));

vi.mock(
	"../../../src/backend-components/Form/Form",
	async (importOriginal) => ({
		...(await importOriginal<
			typeof import("../../../src/backend-components/Form/Form")
		>()),
		useFormContextLite: () => ({ flowEngine: true, submit }),
	}),
);

afterEach(() => {
	cleanup();
	submit.mockClear();
});

type Stage = "first" | "second";
type StageProps = FlowStageProps<ModelUnknown, Stage, unknown>;

/** Shows the stage; one button per way of going to the second one */
const StageView = (props: StageProps) => (
	<>
		<p>{props.stage}</p>
		<button
			onClick={() =>
				void props.goToStage("second", false, { ignoreWarnings: true })
			}
		>
			go
		</button>
		<button
			onClick={() =>
				void props.safeGoToStage("second", true, { ignoreDirtyCheck: true })
			}
		>
			safe go
		</button>
		<button onClick={() => void props.goToStage("second", true)}>plain</button>
	</>
);

const renderFlow = () =>
	render(
		<FlowEngine<ModelUnknown, Stage, unknown>
			defaultStage={"first"}
			formProps={{} as PageProps<ModelUnknown, unknown>}
		>
			{{ first: StageView, second: StageView }}
		</FlowEngine>,
	);

describe("FlowEngine goToStage", () => {
	it("hands the submit options to the form's submit", async () => {
		renderFlow();
		fireEvent.click(screen.getByRole("button", { name: "go" }));
		await waitFor(() => expect(screen.getByText("second")).toBeTruthy());
		expect(submit).toHaveBeenCalledWith({
			ignoreWarnings: true,
			submitToServer: false,
		});
	});

	it("hands them over from safeGoToStage too", async () => {
		renderFlow();
		fireEvent.click(screen.getByRole("button", { name: "safe go" }));
		await waitFor(() => expect(screen.getByText("second")).toBeTruthy());
		expect(submit).toHaveBeenCalledWith({
			ignoreDirtyCheck: true,
			submitToServer: true,
		});
	});

	it("submits with submitToServer alone without options", async () => {
		renderFlow();
		fireEvent.click(screen.getByRole("button", { name: "plain" }));
		await waitFor(() => expect(screen.getByText("second")).toBeTruthy());
		expect(submit).toHaveBeenCalledWith({ submitToServer: true });
	});
});
