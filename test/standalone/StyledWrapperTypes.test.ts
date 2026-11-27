import { beforeAll, describe, expect, it } from "vitest";
import path from "node:path";
import ts from "typescript";

/**
 * The library's own `styled(Component, options)` wrappers, as the compiler types
 * them. MUI's typing of `styled(Component, { name, slot })` picks its overload for
 * a `shouldForwardProp` type guard, which passes the props through
 * `Pick<Props, keyof Props>` and so merges the members of a union of props into
 * one object type: a rule such as InlineSwitch's "onChange unless disabled" is no
 * longer checked through such a wrapper unless its result is typed as the wrapped
 * component.
 *
 * The wrappers are private to their modules, so the checks are compiled inside
 * them: a few lines are appended to the module's source, in one program over the
 * library's sources.
 */

const root = path.resolve(__dirname, "../..") + "/";

const libraryConfig = (): ts.ParsedCommandLine => {
	const config = ts.getParsedCommandLineOfConfigFile(
		root + "tsconfig.json",
		{},
		{
			...ts.sys,
			onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
				throw new Error(
					ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
				);
			},
		},
	);
	if (!config) throw new Error("tsconfig.json not found");
	return config;
};

/** InlineSwitch's rule, checked through the module's `StyledInlineSwitch` */
const inlineSwitchProbe = `
export const inlineSwitchRuleProbe = (
	onChange: (checked: boolean) => void,
	disabled: boolean,
) => [
	// @ts-expect-error a switch the user can toggle needs onChange
	<StyledInlineSwitch key="none" value={false} visible label="L" />,
	// @ts-expect-error disabled={false} still needs onChange
	<StyledInlineSwitch key="enabled" value={false} visible label="L" disabled={false} />,
	// @ts-expect-error a boolean disabled can be false, so it still needs onChange
	<StyledInlineSwitch key="maybe" value={false} visible label="L" disabled={disabled} />,
	<StyledInlineSwitch key="disabled" value={false} visible label="L" disabled />,
	<StyledInlineSwitch key="handler" value={false} visible label="L" disabled={disabled} onChange={onChange} />,
];
`;

const inlineSwitchWrappers = [
	"src/standalone/Selector/BaseSelector.tsx",
	"src/standalone/Selector/MultiSelectWithoutGroup.tsx",
];

let program: ts.Program;

beforeAll(() => {
	const config = libraryConfig();
	const options: ts.CompilerOptions = {
		...config.options,
		noEmit: true,
		declaration: false,
	};
	const probed = new Map(
		inlineSwitchWrappers.map((file) => [
			root + file,
			ts.sys.readFile(root + file)! + inlineSwitchProbe,
		]),
	);
	const host = ts.createCompilerHost(options);
	const readFile = host.readFile.bind(host);
	const getSourceFile = host.getSourceFile.bind(host);
	host.readFile = (fileName) => probed.get(fileName) ?? readFile(fileName);
	host.getSourceFile = (fileName, languageVersion, ...rest) => {
		const text = probed.get(fileName);
		return text !== undefined
			? ts.createSourceFile(fileName, text, languageVersion, true)
			: getSourceFile(fileName, languageVersion, ...rest);
	};
	program = ts.createProgram({
		rootNames: config.fileNames,
		options,
		host,
	});
}, 120000);

const diagnosticsOf = (file: string): string[] => {
	const sourceFile = program.getSourceFile(root + file);
	if (!sourceFile) throw new Error(`${file} is not in the program`);
	return [
		...program.getSyntacticDiagnostics(sourceFile),
		...program.getSemanticDiagnostics(sourceFile),
	].map((diagnostic) => {
		const { line } = sourceFile.getLineAndCharacterOfPosition(
			diagnostic.start ?? 0,
		);
		return `line ${line + 1}: ${ts.flattenDiagnosticMessageText(
			diagnostic.messageText,
			" ",
		)}`;
	});
};

describe("InlineSwitch inside the selectors' own wrappers", () => {
	it.each(inlineSwitchWrappers)(
		"[ISSUE-3465-ITEM-23] %s: a switch without onChange does not compile through the module's styled InlineSwitch unless it is disabled",
		(file) => {
			// an unused @ts-expect-error is reported: the line compiled
			expect(diagnosticsOf(file)).toEqual([]);
		},
	);
});

/**
 * The props of a component type: the first parameter of its signatures, also of
 * each member of a union such as `React.ComponentType` (a class or a function)
 */
const propsOf = (checker: ts.TypeChecker, type: ts.Type): ts.Type[] =>
	(type.isUnion() ? type.types : [type]).flatMap((member) =>
		[...member.getCallSignatures(), ...member.getConstructSignatures()].flatMap(
			(signature) => {
				const props = signature.getParameters()[0];
				return props ? [checker.getTypeOfSymbol(props)] : [];
			},
		),
	);

/** A union of at least two object types: props whose members carry rules */
const isPropsUnion = (checker: ts.TypeChecker, type: ts.Type) => {
	const props = checker.getNonNullableType(type);
	return (
		props.isUnion() &&
		props.types.filter(
			(member) =>
				!!(member.flags & ts.TypeFlags.Object) || member.isIntersection(),
		).length > 1
	);
};

/**
 * The type the result of `styled(Component, options)(styles)` ends up with: the
 * type it is cast to, or the declared type of the variable that holds it
 */
const wrapperTypeOf = (
	checker: ts.TypeChecker,
	styledCall: ts.CallExpression,
): ts.Type => {
	let node: ts.Expression = styledCall;
	if (ts.isCallExpression(node.parent) && node.parent.expression === styledCall)
		node = node.parent;
	while (
		ts.isParenthesizedExpression(node.parent) ||
		ts.isAsExpression(node.parent) ||
		ts.isSatisfiesExpression(node.parent) ||
		ts.isNonNullExpression(node.parent)
	)
		node = node.parent;
	return ts.isVariableDeclaration(node.parent) &&
		node.parent.initializer === node
		? checker.getTypeAtLocation(node.parent.name)
		: checker.getTypeAtLocation(node);
};

describe("styled wrappers of components whose props are a union", () => {
	it("[ISSUE-3465-ITEM-23] every styled(Component, options) in the library keeps the union of its component's props", () => {
		const checker = program.getTypeChecker();
		const wrappers: string[] = [];
		const merged: string[] = [];
		for (const sourceFile of program.getSourceFiles()) {
			if (!sourceFile.fileName.startsWith(root + "src/")) continue;
			const visit = (node: ts.Node) => {
				if (
					ts.isCallExpression(node) &&
					ts.isIdentifier(node.expression) &&
					node.expression.text === "styled" &&
					node.arguments.length >= 2 &&
					!ts.isStringLiteralLike(node.arguments[0])
				) {
					const component = node.arguments[0];
					const componentProps = propsOf(
						checker,
						checker.getTypeAtLocation(component),
					);
					if (componentProps.some((props) => isPropsUnion(checker, props))) {
						const { line } = sourceFile.getLineAndCharacterOfPosition(
							node.getStart(),
						);
						const where = `${path.relative(root, sourceFile.fileName)}:${line + 1} styled(${component.getText()}, …)`;
						wrappers.push(where);
						const wrapperProps = propsOf(checker, wrapperTypeOf(checker, node));
						if (!wrapperProps.some((props) => isPropsUnion(checker, props)))
							merged.push(where);
					}
				}
				ts.forEachChild(node, visit);
			};
			visit(sourceFile);
		}
		// the search finds the wrappers this test is about
		expect(wrappers).toEqual(
			expect.arrayContaining([
				expect.stringContaining("src/standalone/Selector/BaseSelector.tsx:"),
				expect.stringContaining(
					"src/standalone/Selector/MultiSelectWithoutGroup.tsx:",
				),
			]),
		);
		expect(merged).toEqual([]);
	});
});
