import "@testing-library/jest-dom/vitest";
import React, { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { Framework } from "../../../src/framework";
import {
	configureErrorReporting,
	defaultErrorReporter,
} from "../../../src/framework/ErrorReporting";
import Form, { PageProps } from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import BasicFormPage, {
	BasicFormPageRendererProps,
	EnhancedCustomProps,
} from "../../../src/backend-components/Form/BasicFormPage";
import DefaultFormPage from "../../../src/backend-components/Form/DefaultFormPage";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import {
	backButton,
	buttonNames,
	connectorOf,
	findLeavePrompt,
	leavePrompts,
	LOAD,
	makeDirty,
	makePage,
	makePeopleModel,
	mountPage,
	PeopleModel,
	setupPageTests,
	TestCustomProps,
	wait,
} from "./pageFixture";

setupPageTests();

const FieldPage = makePage();
const RelabeledPage = makePage({
	textButtonSave: "Create",
	textButtonBack: "Cancel",
});

const NO_FOOTER_PROPS = {};

type FooterProps = BasicFormPageRendererProps<
	EnhancedCustomProps<TestCustomProps>
>;

/**
 * A BasicFormPage around the first name with the given footer component
 */
const makeBasicPage = (Footer: React.ComponentType<FooterProps>) => {
	const Page = (props: PageProps<PeopleModel, TestCustomProps>) => (
		<BasicFormPage
			{...props}
			form={<FormField name="first_name" />}
			childrenProps={NO_FOOTER_PROPS}
		>
			{Footer}
		</BasicFormPage>
	);
	return Page;
};

/**
 * A DefaultFormPage whose extra button switches the labels between unset and
 * "Create" / "Cancel"
 */
const RelabelLaterPage = (props: PageProps<PeopleModel, TestCustomProps>) => {
	const [relabeled, setRelabeled] = useState(false);
	return (
		<DefaultFormPage
			{...props}
			customProps={{
				...props.customProps,
				open: () => {},
				hasCustomSubmitHandler: false,
			}}
			textButtonSave={relabeled ? "Create" : undefined}
			textButtonBack={relabeled ? "Cancel" : undefined}
			extraButtons={
				<button type={"button"} onClick={() => setRelabeled((r) => !r)}>
					Relabel
				</button>
			}
		>
			<FormField name="first_name" />
		</DefaultFormPage>
	);
};

describe("DefaultFormPage footer", () => {
	it("[ISSUE-3503-ITEM-5] textButtonSave and textButtonBack label the buttons", async () => {
		mountPage(RelabeledPage);
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		expect(buttonNames()).toEqual(["Create", "Cancel"]);
	});

	it("[ISSUE-3503-ITEM-5] the relabeled buttons are named by their labels, Create saves and Cancel goes back", async () => {
		const model = makePeopleModel();
		const update = vi.spyOn(connectorOf(model), "update");
		const { goBack } = mountPage(RelabeledPage, { model });
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
		fireEvent.change(input, { target: { value: "AliceX" } });
		const create = screen.getByRole("button", { name: "Create" });
		await waitFor(() =>
			expect(create).not.toHaveAttribute("aria-disabled", "true"),
		);
		fireEvent.click(create);
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		// unavailable after the save, but focusable (aria-disabled, not the native disabled)
		await waitFor(() =>
			expect(create).toHaveAttribute("aria-disabled", "true"),
		);
		const cancel = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancel).toBeEnabled());
		fireEvent.click(cancel);
		await waitFor(() => expect(goBack).toHaveBeenCalledTimes(1));
	});

	it("[ISSUE-3503-ITEM-5] labels set or removed after mount take effect", async () => {
		mountPage(RelabelLaterPage);
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		expect(buttonNames()).toEqual(["Save", "Relabel", "Back"]);
		fireEvent.click(screen.getByRole("button", { name: "Relabel" }));
		await waitFor(() =>
			expect(buttonNames()).toEqual(["Create", "Relabel", "Cancel"]),
		);
		fireEvent.click(screen.getByRole("button", { name: "Relabel" }));
		await waitFor(() =>
			expect(buttonNames()).toEqual(["Save", "Relabel", "Back"]),
		);
	});

	it("[ISSUE-3503-ITEM-9] an error thrown by goBack is reported, not swallowed", async () => {
		const report = vi.fn();
		configureErrorReporting({ report });
		try {
			const goBack = vi.fn(() => {
				throw new Error("boom from goBack");
			});
			mountPage(FieldPage, { goBack });
			await screen.findByDisplayValue("Alice", undefined, LOAD);
			fireEvent.click(backButton());
			await waitFor(() => expect(goBack).toHaveBeenCalledTimes(1));
			await wait(50);
			expect(report).toHaveBeenCalledWith(
				expect.objectContaining({ message: "boom from goBack" }),
				expect.anything(),
			);
		} finally {
			configureErrorReporting({ report: defaultErrorReporter });
		}
	});

	it("[ISSUE-3503-ITEM-9] an error thrown by goBack after Yes on the leave prompt is reported and shown, and the edit stays", async () => {
		const report = vi.fn();
		configureErrorReporting({ report });
		try {
			const goBack = vi.fn(() => {
				throw new Error("boom from goBack");
			});
			mountPage(FieldPage, { goBack });
			const input = await makeDirty();
			fireEvent.click(backButton());
			fireEvent.click(
				within(await findLeavePrompt()).getByRole("button", { name: "Yes" }),
			);
			const dialog = await screen.findByRole("dialog", {
				name: "An error occurred",
			});
			expect(dialog).toHaveTextContent("boom from goBack");
			expect(report).toHaveBeenCalledTimes(1);
			expect(report).toHaveBeenCalledWith(
				expect.objectContaining({ message: "boom from goBack" }),
				expect.objectContaining({ source: "BasicFormPage.goBack" }),
			);
			fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
			await waitFor(() =>
				expect(
					screen.queryByRole("dialog", { name: "An error occurred" }),
				).toBeNull(),
			);
			expect(input).toHaveValue("AliceX");
		} finally {
			configureErrorReporting({ report: defaultErrorReporter });
		}
	});

	it("[ISSUE-3503-ITEM-9] No on the leave prompt cancels: goBack is not called, and nothing is reported or shown", async () => {
		const report = vi.fn();
		configureErrorReporting({ report });
		try {
			const { goBack } = mountPage(FieldPage);
			await makeDirty();
			fireEvent.click(backButton());
			fireEvent.click(
				within(await findLeavePrompt()).getByRole("button", { name: "No" }),
			);
			await waitFor(() => expect(leavePrompts()).toHaveLength(0));
			await wait(50);
			expect(goBack).not.toHaveBeenCalled();
			expect(report).not.toHaveBeenCalled();
			expect(
				screen.queryByRole("dialog", { name: "An error occurred" }),
			).toBeNull();
		} finally {
			configureErrorReporting({ report: defaultErrorReporter });
		}
	});
});

describe("BasicFormPage with its own footer", () => {
	it("[ISSUE-3503-ITEM-9] the confirming goBack resolves, not rejects, once the error dialog of a throwing goBack is closed", async () => {
		const settled: string[] = [];
		const Footer = (p: FooterProps) => (
			<button
				type={"button"}
				onClick={() => {
					void Promise.resolve(p.customProps.goBack()).then(
						() => settled.push("resolved"),
						() => settled.push("rejected"),
					);
				}}
			>
				Go back
			</button>
		);
		const goBack = vi.fn(() => {
			throw new Error("boom from goBack");
		});
		mountPage(makeBasicPage(Footer), { goBack });
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		fireEvent.click(screen.getByRole("button", { name: "Go back" }));
		const dialog = await screen.findByRole("dialog", {
			name: "An error occurred",
		});
		expect(dialog).toHaveTextContent("boom from goBack");
		await wait(50);
		expect(settled).toEqual([]);
		fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
		await waitFor(() => expect(settled).toEqual(["resolved"]));
	});

	it("[ISSUE-3503-ITEM-10] the footer gets the methods of a class instance passed as customProps", async () => {
		class PersonActions {
			goBack = vi.fn();
			describe() {
				return "Person actions";
			}
		}
		const Footer = (
			p: BasicFormPageRendererProps<EnhancedCustomProps<PersonActions>>,
		) => (
			<span data-testid={"footer"}>
				{typeof p.customProps.describe === "function"
					? p.customProps.describe()
					: "describe() is missing"}
			</span>
		);
		const Page = (props: PageProps<PeopleModel, PersonActions>) => (
			<BasicFormPage
				{...props}
				form={<FormField name="first_name" />}
				childrenProps={NO_FOOTER_PROPS}
			>
				{Footer}
			</BasicFormPage>
		);
		render(
			<Framework>
				<Form
					model={makePeopleModel()}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					customProps={new PersonActions()}
					disableRouting
				>
					{Page}
				</Form>
			</Framework>,
		);
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		expect(screen.getByTestId("footer")).toHaveTextContent("Person actions");
	});

	it("[ISSUE-3503-ITEM-10] without a goBack the footer gets the Form's customProps object itself", async () => {
		interface LabelProps {
			label: string;
		}
		const seen: LabelProps[] = [];
		const Recorder = (p: BasicFormPageRendererProps<LabelProps>) => {
			seen.push(p.customProps);
			return null;
		};
		const Page = (props: PageProps<PeopleModel, LabelProps>) => (
			<BasicFormPage
				{...props}
				form={<FormField name="first_name" />}
				childrenProps={NO_FOOTER_PROPS}
			>
				{Recorder}
			</BasicFormPage>
		);
		const customProps: LabelProps = { label: "no goBack" };
		render(
			<Framework>
				<Form
					model={makePeopleModel()}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					customProps={customProps}
					disableRouting
				>
					{Page}
				</Form>
			</Framework>,
		);
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		expect(seen.length).toBeGreaterThan(0);
		for (const props of seen) expect(props).toBe(customProps);
	});

	it("[ISSUE-3503-ITEM-10] the footer's customProps keep their identity while the page re-renders", async () => {
		const seen: FooterProps["customProps"][] = [];
		const Recorder = (p: FooterProps) => {
			seen.push(p.customProps);
			return null;
		};
		mountPage(makeBasicPage(Recorder));
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
		const rendersBefore = seen.length;
		// the page re-renders as the form turns dirty
		fireEvent.change(input, { target: { value: "AliceX" } });
		await waitFor(() => expect(seen.length).toBeGreaterThan(rendersBefore));
		expect(new Set(seen).size).toBe(1);
	});

	it("[ISSUE-3503-ITEM-10] the confirming goBack keeps its identity when the Form gets new customProps, and calls the goBack passed last", async () => {
		const goBacks: FooterProps["customProps"]["goBack"][] = [];
		const Footer = (p: FooterProps) => {
			goBacks.push(p.customProps.goBack);
			return (
				<button type={"button"} onClick={() => void p.customProps.goBack()}>
					Go back
				</button>
			);
		};
		const Page = makeBasicPage(Footer);
		const model = makePeopleModel();
		const mount = (goBack: TestCustomProps["goBack"]) => (
			<Framework>
				<Form
					model={model}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					customProps={{ goBack }}
					disableRouting
				>
					{Page}
				</Form>
			</Framework>
		);
		const first = vi.fn();
		const last = vi.fn();
		const { rerender } = render(mount(first));
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		const rendersBefore = goBacks.length;
		rerender(mount(last));
		await waitFor(() => expect(goBacks.length).toBeGreaterThan(rendersBefore));
		expect(new Set(goBacks).size).toBe(1);
		fireEvent.click(screen.getByRole("button", { name: "Go back" }));
		await waitFor(() => expect(last).toHaveBeenCalledTimes(1));
		expect(first).not.toHaveBeenCalled();
	});

	it("[ISSUE-3503-ITEM-10] a goBack method of a class instance is called on the instance", async () => {
		class Navigation {
			steps = 0;
			goBack() {
				this.steps += 1;
			}
		}
		const navigation = new Navigation();
		const Footer = (
			p: BasicFormPageRendererProps<EnhancedCustomProps<Navigation>>,
		) => (
			<button type={"button"} onClick={() => void p.customProps.goBack()}>
				Go back
			</button>
		);
		const Page = (props: PageProps<PeopleModel, Navigation>) => (
			<BasicFormPage
				{...props}
				form={<FormField name="first_name" />}
				childrenProps={NO_FOOTER_PROPS}
			>
				{Footer}
			</BasicFormPage>
		);
		render(
			<Framework>
				<Form
					model={makePeopleModel()}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					customProps={navigation}
					disableRouting
				>
					{Page}
				</Form>
			</Framework>,
		);
		await screen.findByDisplayValue("Alice", undefined, LOAD);
		fireEvent.click(screen.getByRole("button", { name: "Go back" }));
		await waitFor(() => expect(navigation.steps).toBe(1));
		expect(
			screen.queryByRole("dialog", { name: "An error occurred" }),
		).toBeNull();
	});
});
