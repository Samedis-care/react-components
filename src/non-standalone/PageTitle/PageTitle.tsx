import React, { useEffect, useState } from "react";
import {
	styled,
	Typography,
	TypographyProps,
	useThemeProps,
} from "@mui/material";
import { useForkRef } from "@mui/material/utils";
import useSetFormDialogTitle from "../../backend-components/Form/useSetFormDialogTitle";
import usePageTitle from "../../standalone/Routes/usePageTitle";

export interface PageTitleProps extends TypographyProps {
	/**
	 * The title, already translated: text, or content whose text names the
	 * page (e.g. a record name in a `<b>`)
	 */
	children?: React.ReactNode;
	/**
	 * The Typography variant, which also picks the element (`h1` renders an
	 * `<h1>`, change the element with `component`).
	 * @default "h1"
	 */
	variant?: TypographyProps["variant"];
	/**
	 * Only render the heading: it neither moves into an enclosing
	 * FullFormDialog's title bar nor names the document. For a heading that is
	 * not the page's title, or a page that names itself with `usePageTitle`.
	 * @default false
	 */
	disableAutoTitle?: boolean;
}

const PageTitleRoot = styled(Typography, {
	name: "CcPageTitle",
	slot: "root",
})({});

export type PageTitleClassKey = "root";

/**
 * The text of an element, kept up to date while its content changes
 * @param element The element, null for none
 * @returns The text with its white space collapsed, null for none or empty
 */
const useTextContent = (element: HTMLElement | null): string | null => {
	const [text, setText] = useState<string | null>(null);
	useEffect(() => {
		if (!element) return;
		const update = () =>
			setText((element.textContent ?? "").replace(/\s+/g, " ").trim() || null);
		update();
		const observer = new MutationObserver(update);
		observer.observe(element, {
			subtree: true,
			childList: true,
			characterData: true,
		});
		return () => observer.disconnect();
	}, [element]);
	return element ? text : null;
};

/**
 * The visible title of a page: a heading (`<h1>` by default) that also names
 * the document (browser tab, history, what a screen reader announces for the
 * window) after its text, through `usePageTitle`. HistoryRouter builds the
 * document title from it, by default "<text> – <app title>", e.g.
 * "Device 4711 – Samedis.care".
 *
 * Inside a FullFormDialog it renders nothing and its content becomes the
 * dialog's title instead (see `useSetFormDialogTitle`), so a page opened in a
 * dialog does not repeat its title below the title bar; the document title
 * stays the one of the page below the dialog.
 *
 * Pages without a visible heading name themselves with `usePageTitle`.
 * Theme: `CcPageTitle` (default props, style overrides of the root slot).
 * @param props The props, those of MUI's Typography plus disableAutoTitle
 */
const PageTitle = React.forwardRef(function PageTitle(
	inProps: PageTitleProps,
	ref: React.ForwardedRef<HTMLElement>,
) {
	const props = useThemeProps({ props: inProps, name: "CcPageTitle" });
	const { disableAutoTitle, variant, ...typographyProps } = props;
	const inDialog = useSetFormDialogTitle(!disableAutoTitle, props.children);
	const [element, setElement] = useState<HTMLElement | null>(null);
	const handleRef = useForkRef(ref, setElement);
	const text = useTextContent(disableAutoTitle ? null : element);
	usePageTitle(inDialog ? null : text);

	if (inDialog) return null;
	return (
		<PageTitleRoot
			ref={handleRef}
			variant={variant ?? "h1"}
			{...typographyProps}
		/>
	);
});

export default React.memo(PageTitle);
