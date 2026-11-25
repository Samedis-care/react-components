// @vitest-environment node
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ESLint, RuleTester } from "eslint";
// the package has only "exports", which import/no-unresolved's node resolver doesn't read
// eslint-disable-next-line import/no-unresolved
import { parser } from "typescript-eslint";
import rule from "../../eslint-rules/no-own-state-in-setter.mjs";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
	languageOptions: {
		parser,
		parserOptions: { ecmaFeatures: { jsx: true } },
	},
});

/**
 * Wraps statements into a component with `const [<state>, <setter>] = useState(…)`.
 * @param body the statements after the declaration
 * @param declaration the state declaration
 * @returns the source of a module
 */
const component = (
	body: string,
	declaration = "const [open, setOpen] = useState(false);",
) => `import React, { useState } from "react";
const Component = () => {
	${declaration}
	${body}
	return null;
};
`;

const COUNT = "const [count, setCount] = useState(0);";
const ITEMS = 'const [items, setItems] = useState<string[]>(["a"]);';

ruleTester.run("no-own-state-in-setter", rule, {
	valid: [
		// the updater's parameter
		component("const toggle = () => setOpen((prev) => !prev);"),
		// a value that doesn't read the state
		component("const close = () => setOpen(false);"),
		// the parameter is named like the state and shadows it
		component("const inc = () => setCount((count) => count + 1);", COUNT),
		// a local variable named like the state
		component("const select = (open: boolean) => setOpen(open);"),
		// another state's setter
		component(
			"const [other, setOther] = useState(false); const sync = () => setOther(!open);",
		),
		// a value computed from the state before the call
		component("const toggle = () => { const next = !open; setOpen(next); };"),
		// the state read next to the call, not in it
		component("React.useEffect(() => { if (open) setOpen(false); }, [open]);"),
		// the setter passed on, not called
		component("const element = <input onChange={setOpen} checked={open} />;"),
		component("const watch = () => subscribe(setOpen, open);"),
		// only the state's type
		component(
			"const set = (next: unknown) => setCount(next as typeof count);",
			COUNT,
		),
		// a hook other than useState
		component(
			"const inc = () => setCount(count + 1);",
			"const [count, setCount] = useCounter(0);",
		),
		component(
			"const inc = () => dispatch(count + 1);",
			"const [count, dispatch] = React.useReducer(reducer, 0);",
		),
		// no state variable to read
		component(
			"const close = () => setOpen(false);",
			"const [, setOpen] = useState(false);",
		),
	],
	invalid: [
		{
			// a value computed from the state
			code: component("const toggle = () => setOpen(!open);"),
			errors: [
				{
					messageId: "value",
					data: { setter: "setOpen", state: "open" },
					line: 4,
					column: 32,
					suggestions: [
						{
							messageId: "useUpdater",
							data: { name: "prev" },
							output: component(
								"const toggle = () => setOpen((prev) => !prev);",
							),
						},
					],
				},
			],
		},
		{
			// React.useState, in JSX
			code: component(
				"const element = <button onClick={() => setCount(count + 1)} />;",
				"const [count, setCount] = React.useState(0);",
			),
			errors: [
				{
					messageId: "value",
					data: { setter: "setCount", state: "count" },
					suggestions: [
						{
							messageId: "useUpdater",
							output: component(
								"const element = <button onClick={() => setCount((prev) => prev + 1)} />;",
								"const [count, setCount] = React.useState(0);",
							),
						},
					],
				},
			],
		},
		{
			// after an await, where the state the callback captured is most likely outdated;
			// several reads are one error
			code: component(
				'const add = async () => { await save(); setItems([...items.filter((item) => item !== "b"), items[0]]); };',
				ITEMS,
			),
			errors: [
				{
					messageId: "value",
					data: { setter: "setItems", state: "items" },
					suggestions: [
						{
							messageId: "useUpdater",
							output: component(
								'const add = async () => { await save(); setItems((prev) => [...prev.filter((item) => item !== "b"), prev[0]]); };',
								ITEMS,
							),
						},
					],
				},
			],
		},
		{
			// each call is an error
			code: component(
				"const twice = () => { setCount(count + 1); setCount(count + 2); };",
				COUNT,
			),
			errors: [
				{
					messageId: "value",
					column: 33,
					suggestions: [
						{
							messageId: "useUpdater",
							output: component(
								"const twice = () => { setCount((prev) => prev + 1); setCount(count + 2); };",
								COUNT,
							),
						},
					],
				},
				{
					messageId: "value",
					column: 54,
					suggestions: [
						{
							messageId: "useUpdater",
							output: component(
								"const twice = () => { setCount(count + 1); setCount((prev) => prev + 2); };",
								COUNT,
							),
						},
					],
				},
			],
		},
		{
			// an object literal becomes a parenthesized body; a shorthand keeps its key
			code: component(
				"const reset = () => setFilter({ ...filter, page: 0, filter });",
				"const [filter, setFilter] = useState({ page: 1 });",
			),
			errors: [
				{
					messageId: "value",
					suggestions: [
						{
							messageId: "useUpdater",
							output: component(
								"const reset = () => setFilter((prev) => ({ ...prev, page: 0, filter: prev }));",
								"const [filter, setFilter] = useState({ page: 1 });",
							),
						},
					],
				},
			],
		},
		{
			// a parenthesized sequence stays one body
			code: component("const inc = () => setCount((log(), count + 1));", COUNT),
			errors: [
				{
					messageId: "value",
					suggestions: [
						{
							messageId: "useUpdater",
							output: component(
								"const inc = () => setCount(((prev) => (log(), prev + 1)));",
								COUNT,
							),
						},
					],
				},
			],
		},
		{
			// the code already uses `prev`
			code: component(
				"const add = (prev: string) => setItems([...items, prev]);",
				ITEMS,
			),
			errors: [
				{
					messageId: "value",
					suggestions: [
						{
							messageId: "useUpdater",
							data: { name: "prevItems" },
							output: component(
								"const add = (prev: string) => setItems((prevItems) => [...prevItems, prev]);",
								ITEMS,
							),
						},
					],
				},
			],
		},
		{
			// an updater without a parameter
			code: component("const toggle = () => setOpen(() => !open);"),
			errors: [
				{
					messageId: "updater",
					data: { setter: "setOpen", state: "open" },
					suggestions: [
						{
							messageId: "useParameter",
							data: { name: "prev" },
							output: component(
								"const toggle = () => setOpen((prev) => !prev);",
							),
						},
					],
				},
			],
		},
		{
			// a function expression as the updater
			code: component(
				"const inc = () => setCount(function () { return count + 1; });",
				COUNT,
			),
			errors: [
				{
					messageId: "updater",
					suggestions: [
						{
							messageId: "useParameter",
							output: component(
								"const inc = () => setCount(function (prev) { return prev + 1; });",
								COUNT,
							),
						},
					],
				},
			],
		},
		{
			// an updater that reads its parameter and the state
			code: component(
				'const add = () => setItems((current) => (current.length ? [...items, "b"] : current));',
				ITEMS,
			),
			errors: [
				{
					messageId: "updater",
					data: { setter: "setItems", state: "items" },
					suggestions: [
						{
							messageId: "useParameter",
							data: { name: "current" },
							output: component(
								'const add = () => setItems((current) => (current.length ? [...current, "b"] : current));',
								ITEMS,
							),
						},
					],
				},
			],
		},
		{
			// the parameter's name means something else where the state is read: no suggestion
			code: component(
				"const add = () => setItems((prev) => prev.map((prev) => prev + items.length));",
				ITEMS,
			),
			errors: [{ messageId: "updater", suggestions: [] }],
		},
		{
			// the state read in the parameter's default: no suggestion
			code: component(
				"const inc = () => setCount((prev = count) => prev + 1);",
				COUNT,
			),
			errors: [{ messageId: "updater", suggestions: [] }],
		},
		{
			// a destructured parameter: no suggestion
			code: component(
				"const move = () => setPoint(({ x }) => ({ x, y: point.y + 1 }));",
				"const [point, setPoint] = useState({ x: 0, y: 0 });",
			),
			errors: [
				{
					messageId: "updater",
					data: { setter: "setPoint", state: "point" },
					suggestions: [],
				},
			],
		},
		{
			// an async function is no updater: no suggestion
			code: component("const inc = () => setCount(async () => count);", COUNT),
			errors: [{ messageId: "updater", suggestions: [] }],
		},
		{
			// a destructured state: no suggestion
			code: component(
				"const inc = () => setPair({ a: a + 1, b });",
				"const [{ a, b }, setPair] = useState({ a: 0, b: 0 });",
			),
			errors: [
				{
					messageId: "value",
					data: { setter: "setPair", state: "a" },
					suggestions: [],
				},
			],
		},
		{
			// a component in state, read as an element: no suggestion, `<prev />` is HTML
			code: component(
				"const wrap = () => setPanel(() => () => <Panel />);",
				"const [Panel, setPanel] = useState<React.ComponentType>(() => Base);",
			),
			errors: [
				{
					messageId: "updater",
					data: { setter: "setPanel", state: "Panel" },
					suggestions: [],
				},
			],
		},
		{
			// a spread or extra argument: no suggestion
			code: component(
				"const a = () => setCount(...[count]); const b = () => setCount(count, 1);",
				COUNT,
			),
			errors: [
				{ messageId: "value", suggestions: [] },
				{ messageId: "value", suggestions: [] },
			],
		},
	],
});

describe("the repository's config", () => {
	it("reports a setState that reads its own state as an error in src and test", async () => {
		const eslint = new ESLint({
			cwd: fileURLToPath(new URL("../..", import.meta.url)),
		});
		for (const file of ["src/index.ts", "test/setup.ts"]) {
			const config = (await eslint.calculateConfigForFile(file)) as {
				rules: Record<string, unknown>;
			};
			// useState
			expect(config.rules["local/no-own-state-in-setter"]).toEqual([2]);
			// class components
			expect(config.rules["react/no-access-state-in-setstate"]).toEqual([2]);
		}
	});
});
