import React from "react";
export declare const initialTreeData: ({
    parentId: null;
    id: string;
    expanded: boolean;
    hasChildren: boolean;
    icon: null;
    label: string;
} | {
    parentId: string;
    id: string;
    expanded: boolean;
    hasChildren: boolean;
    icon: null;
    label: string;
})[];
export declare const TreeViewStory: {
    (): React.ReactElement;
    storyName: string;
};
