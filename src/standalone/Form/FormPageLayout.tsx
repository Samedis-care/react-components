import { styled, useThemeProps } from "@mui/material";
import React from "react";
import combineClassNames from "../../utils/combineClassNames";

export interface FormPageLayoutProps {
	/**
	 * Page content, usually the form. A flex column that fills the layout's height
	 * when the layout is stretched by its parent.
	 */
	body: React.ReactNode;
	/**
	 * Button bar, usually `<FormButtons>`. Follows the body and, while the body is
	 * longer than the visible area, floats over its bottom (see
	 * {@link FormPageLayout}); give it an opaque background, as FormButtons has, so
	 * that the content scrolling under it is hidden. `null` for no buttons.
	 */
	footer: React.ReactNode;
	/**
	 * Rendered inside the root after body and footer. The root is positioned, so an
	 * absolutely positioned `other`, like the busy overlay (`FormLoaderOverlay`) that
	 * BasicFormPage passes here, covers the whole layout and nothing outside it.
	 * @default undefined (nothing)
	 */
	other?: React.ReactNode;
	/**
	 * class name to apply to root
	 */
	className?: string;
	/**
	 * custom CSS classes
	 */
	classes?: Partial<Record<FormPageLayoutClassKey, string>>;
}

const Root = styled("div", { name: "CcFormPageLayout", slot: "root" })({
	flexGrow: 1,
	display: "flex",
	flexDirection: "column",
	// the containing block of `other`: the busy overlay covers the whole layout,
	// wherever it is placed and however far it is scrolled
	position: "relative",
});

const Wrapper = styled("div", { name: "CcFormPageLayout", slot: "wrapper" })({
	flexGrow: 1,
	display: "flex",
	flexDirection: "column",
});

const Body = styled("div", { name: "CcFormPageLayout", slot: "body" })({
	flexGrow: 1,
	display: "flex",
	flexDirection: "column",
	// Its own stacking context, so the footer, which floats over the body and comes
	// after it, paints above all of the body's content and gets every click in its
	// area: also content with a z-index of its own, such as outlined field labels,
	// badges or the DataGrid's settings panel. Unlike a z-index on the footer, this
	// leaves the footer below the busy overlay (`other`) and app-level layers.
	isolation: "isolate",
});

const Footer = styled("div", { name: "CcFormPageLayout", slot: "footer" })({
	// in flow below the body, and while the body scrolls under it, held 36px above
	// the bottom of the content area of whatever scrolls: a scrolling dialog content,
	// panel or main area, or the document
	position: "sticky",
	bottom: 36,
	flexShrink: 0,
	// as wide as its buttons
	alignSelf: "flex-start",
	// 30px between the body's content and the footer, and 36px below the footer when
	// scrolled to the end, where it then rests at the same height
	margin: "30px 0 36px",
	transform: "translateX(36px)",
	padding: 0,
});

export type FormPageLayoutClassKey = "root" | "wrapper" | "body" | "footer";

const FormPageLayout = (inProps: FormPageLayoutProps) => {
	const props = useThemeProps({ props: inProps, name: "CcFormPageLayout" });
	const { body, footer, other, className, classes } = props;

	return (
		<Root className={combineClassNames([className, classes?.root])}>
			<Wrapper className={classes?.wrapper}>
				<Body className={classes?.body}>{body}</Body>
				<Footer className={classes?.footer}>{footer}</Footer>
			</Wrapper>
			{other}
		</Root>
	);
};

/**
 * The page layout of every form page: BasicFormPage, and so DefaultFormPage,
 * EditOnlyFormPage and FlowEngineFormPage, renders the form as `body`, its buttons
 * as `footer` and its busy overlay (FormLoaderOverlay) as `other`.
 *
 * Layout: the root is `position: relative` and does not scroll itself; whatever
 * scrolls around it (a FormDialog's content, a scrolling panel, drawer or main area,
 * or the document) scrolls the form. The footer follows the body in flow, 36px right
 * of its start, and is `position: sticky`: while the body reaches below the visible
 * area, the footer stays 36px above the bottom of the scroll container's content
 * area (inside its padding) and the body scrolls under it. Scrolled to the end, it
 * rests there below the body's content, with 30px above it and 36px below it. A
 * form shorter than the visible area has its footer right below its content, unless
 * the layout is stretched (the root has `flexGrow: 1`, so a flex column parent of
 * definite height stretches it, and the body grows).
 *
 * An `overflow: hidden` ancestor between the layout and the element that scrolls
 * makes the footer stick to that ancestor, which does not scroll, so the footer then
 * stays below the content; use `overflow: clip` there.
 *
 * An absolutely positioned `other` covers the whole layout, however far it is
 * scrolled: the busy overlay covers the form, not the page or dialog around it.
 */
export default React.memo(FormPageLayout);
