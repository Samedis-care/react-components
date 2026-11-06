import React from "react";
import { TypographyProps } from "@mui/material";
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
export type PageTitleClassKey = "root";
declare const _default: React.NamedExoticComponent<Omit<PageTitleProps, "ref"> & React.RefAttributes<HTMLElement>>;
export default _default;
