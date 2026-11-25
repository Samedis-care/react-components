// @ts-check
/**
 * ESLint rule `local/no-own-state-in-setter`: a `useState` setter is not called with a
 * value computed from the state it sets.
 *
 * ```tsx
 * const [open, setOpen] = useState(false);
 * setOpen(!open); // reported
 * setOpen(() => !open); // reported
 * setOpen((prev) => !prev); // fine
 * ```
 *
 * The state a render reads is that render's snapshot. A setter called with a value
 * computed from it overwrites the updates React has queued since that render (a second
 * click before the re-render, a callback or effect holding an older render's state). An
 * updater function gets the latest state as its parameter, so it reads the state there and
 * never through the variable.
 *
 * Covers `useState` and `React.useState` destructured into `[state, setState]`, also a
 * destructured state (`[{ a, b }, setState]`). The rule looks at the setter's argument
 * only: a value computed from the state earlier and then passed in is not reported.
 * It suggests the updater form where it can rewrite the call safely.
 */

/** @typedef {import("eslint").Rule.RuleModule} RuleModule */
/** @typedef {import("eslint").Rule.SuggestionReportDescriptor} Suggestion */
/** @typedef {import("eslint").Scope.Reference} Reference */
/** @typedef {import("eslint").Scope.Scope} Scope */
/** @typedef {import("eslint").Scope.Variable} Variable */
/** @typedef {import("eslint").SourceCode} SourceCode */
/** @typedef {import("estree").Node} Node */
/** @typedef {import("estree").Identifier} Identifier */
/** @typedef {import("estree").CallExpression} CallExpression */
/** @typedef {import("estree").ArrowFunctionExpression | import("estree").FunctionExpression} FunctionNode */
/**
 * A node of any parser (TypeScript's type nodes too) with the parent ESLint sets.
 * @typedef {{ type: string, range?: [number, number], parent?: AnyNode | null }} AnyNode
 */

/**
 * @param {{ type: string }} node
 * @returns {AnyNode | null | undefined} the node's parent
 */
const parentOf = (node) => /** @type {AnyNode} */ (node).parent;

/**
 * @param {{ range?: [number, number] }} node
 * @returns {[number, number]} the node's start and end offset
 */
const rangeOf = (node) => /** @type {[number, number]} */ (node.range);

/**
 * @param {{ range?: [number, number] }} inner
 * @param {{ range?: [number, number] }} outer
 * @returns {boolean} whether `inner` lies within `outer`
 */
const isWithin = (inner, outer) =>
	rangeOf(inner)[0] >= rangeOf(outer)[0] &&
	rangeOf(inner)[1] <= rangeOf(outer)[1];

/**
 * @param {Node | null | undefined} node
 * @returns {boolean} whether the node is a call of `useState` or `<object>.useState`
 */
const isUseStateCall = (node) => {
	if (node?.type !== "CallExpression") return false;
	const callee = node.callee;
	if (callee.type === "Identifier") return callee.name === "useState";
	return (
		callee.type === "MemberExpression" &&
		!callee.computed &&
		callee.property.type === "Identifier" &&
		callee.property.name === "useState"
	);
};

/**
 * @param {Node} node
 * @returns {node is FunctionNode} whether the node is a function, as an updater is
 */
const isFunction = (node) =>
	node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression";

/**
 * @param {Reference} reference
 * @returns {boolean} whether the reference reads the variable's value, not only its type
 * (as `typeof state` in a type annotation does)
 */
const readsValue = (reference) => {
	for (let node = parentOf(reference.identifier); node; node = parentOf(node))
		if (node.type === "TSTypeQuery") return false;
	return true;
};

/**
 * @param {SourceCode} sourceCode
 * @param {Node} node the code the name is used in
 * @param {string} stateName
 * @returns {string} a parameter name no identifier in `node` uses, so it shadows nothing
 * the code reads
 */
const freeParameterName = (sourceCode, node, stateName) => {
	const used = new Set(
		sourceCode
			.getTokens(node)
			.filter((token) => token.type === "Identifier")
			.map((token) => token.value),
	);
	const capitalized = stateName.charAt(0).toUpperCase() + stateName.slice(1);
	for (let i = 0; ; ++i) {
		const name =
			i === 0 ? "prev" : `prev${capitalized}${i === 1 ? "" : String(i)}`;
		if (!used.has(name)) return name;
	}
};

/**
 * @param {Reference} read a read of the state
 * @param {string} name the updater parameter that replaces it
 * @returns {string} the source text that reads `name` where `read` stood
 */
const replacementText = (read, name) => {
	const parent = /** @type {Node} */ (parentOf(read.identifier));
	// `{ state }` keeps its key: `{ state: prev }`
	if (
		parent.type === "Property" &&
		parent.shorthand &&
		parent.value === read.identifier
	)
		return `${read.identifier.name}: ${name}`;
	return name;
};

/**
 * @param {SourceCode} sourceCode
 * @param {Node} node
 * @param {Reference[]} reads the reads of the state within `node`
 * @param {string} name the updater parameter that replaces them
 * @returns {string} the source text of `node` with each read replaced by `name`
 */
const textReplacingReads = (sourceCode, node, reads, name) => {
	const [start] = rangeOf(node);
	let text = sourceCode.getText(node);
	// replace from the end, so the offsets of the earlier reads stay valid
	const fromTheEnd = [...reads].sort(
		(a, b) => rangeOf(b.identifier)[0] - rangeOf(a.identifier)[0],
	);
	for (const read of fromTheEnd) {
		const [readStart, readEnd] = rangeOf(read.identifier);
		text =
			text.slice(0, readStart - start) +
			replacementText(read, name) +
			text.slice(readEnd - start);
	}
	return text;
};

/**
 * @param {SourceCode} sourceCode
 * @param {Reference} read
 * @param {string} name
 * @param {Variable} parameter
 * @returns {boolean} whether `name`, written where `read` is, resolves to `parameter`
 */
const resolvesTo = (sourceCode, read, name, parameter) => {
	/** @type {Scope | null} */
	let scope = sourceCode.getScope(/** @type {Identifier} */ (read.identifier));
	while (scope) {
		const variable = scope.set.get(name);
		if (variable) return variable === parameter;
		scope = scope.upper;
	}
	return false;
};

/**
 * Builds the suggestion that reads the state through the updater's parameter.
 *
 * @param {SourceCode} sourceCode
 * @param {CallExpression} call the setter call
 * @param {Reference[]} reads the reads of the state in its argument
 * @param {string} stateName
 * @returns {Suggestion[]} the suggestion, or none where the call can't be rewritten safely
 */
const suggestUpdater = (sourceCode, call, reads, stateName) => {
	if (call.arguments.length !== 1) return [];
	const argument = call.arguments[0];
	if (argument.type === "SpreadElement") return [];
	// `<State />` can't become `<prev />`, which is an HTML element
	if (reads.some((read) => read.identifier.type === "JSXIdentifier")) return [];
	/**
	 * @param {string} name
	 * @returns {import("eslint").Rule.Fix[]} the fixes that replace the reads by `name`
	 */
	const replaceReads = (name) =>
		reads.map((read) => ({
			range: rangeOf(read.identifier),
			text: replacementText(read, name),
		}));

	if (!isFunction(argument)) {
		// setState(value) -> setState((prev) => value)
		const name = freeParameterName(sourceCode, argument, stateName);
		let body = textReplacingReads(sourceCode, argument, reads, name);
		if (
			sourceCode.getFirstToken(argument)?.value === "{" ||
			argument.type === "SequenceExpression"
		)
			body = `(${body})`;
		return [
			{
				messageId: "useUpdater",
				data: { name },
				fix: (fixer) => fixer.replaceText(argument, `(${name}) => ${body}`),
			},
		];
	}

	if (argument.async || argument.generator) return [];
	if (argument.params.length === 0) {
		// setState(() => f(state)) -> setState((prev) => f(prev))
		const name = freeParameterName(sourceCode, argument, stateName);
		const openParen = sourceCode.getFirstToken(
			argument,
			(token) => token.value === "(",
		);
		if (!openParen) return [];
		return [
			{
				messageId: "useParameter",
				data: { name },
				fix: (fixer) => [
					fixer.insertTextAfter(openParen, name),
					...replaceReads(name),
				],
			},
		];
	}

	// setState((prev) => f(prev, state)) -> setState((prev) => f(prev, prev))
	const parameterNode = argument.params[0];
	if (parameterNode.type !== "Identifier") return [];
	const name = parameterNode.name;
	const parameter = sourceCode
		.getDeclaredVariables(argument)
		.find((variable) => variable.identifiers.includes(parameterNode));
	if (
		!parameter ||
		!reads.every((read) => resolvesTo(sourceCode, read, name, parameter))
	)
		return [];
	return [
		{
			messageId: "useParameter",
			data: { name },
			fix: () => replaceReads(name),
		},
	];
};

/** @type {RuleModule} */
const rule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow reading a useState value in a call of its own setter; read the updater's parameter instead",
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			value:
				"`{{setter}}(…)` reads `{{state}}`, the state it sets, which can be older than React's queued updates. Pass an updater and read its parameter instead: `{{setter}}((prev) => …)`.",
			updater:
				"The updater passed to `{{setter}}` reads `{{state}}`, the state it sets, which can be older than React's queued updates. Read the updater's parameter instead.",
			useUpdater: "Pass an updater that reads `{{name}}`.",
			useParameter: "Read the updater's parameter `{{name}}`.",
		},
	},
	create(context) {
		const { sourceCode } = context;
		return {
			VariableDeclarator(node) {
				if (node.id.type !== "ArrayPattern" || !isUseStateCall(node.init))
					return;
				const [stateElement, setterElement] = node.id.elements;
				if (!stateElement || setterElement?.type !== "Identifier") return;

				const declared = sourceCode.getDeclaredVariables(node);
				const setter = declared.find((variable) =>
					variable.identifiers.includes(setterElement),
				);
				const states = declared.filter((variable) =>
					variable.identifiers.some((identifier) =>
						isWithin(identifier, stateElement),
					),
				);
				if (!setter || states.length === 0) return;

				for (const setterReference of setter.references) {
					const call = /** @type {Node | null | undefined} */ (
						parentOf(setterReference.identifier)
					);
					if (
						call?.type !== "CallExpression" ||
						call.callee !== setterReference.identifier
					)
						continue;
					const reads = states
						.flatMap((state) => state.references)
						.filter(
							(reference) =>
								readsValue(reference) &&
								call.arguments.some((argument) =>
									isWithin(reference.identifier, argument),
								),
						)
						.sort(
							(a, b) => rangeOf(a.identifier)[0] - rangeOf(b.identifier)[0],
						);
					if (reads.length === 0) continue;

					const argument = call.arguments[0];
					const stateName = reads[0].identifier.name;
					context.report({
						node: /** @type {Identifier} */ (reads[0].identifier),
						messageId: isFunction(argument) ? "updater" : "value",
						data: { setter: setterElement.name, state: stateName },
						suggest:
							stateElement.type === "Identifier"
								? suggestUpdater(sourceCode, call, reads, stateName)
								: [],
					});
				}
			},
		};
	},
};

export default rule;
