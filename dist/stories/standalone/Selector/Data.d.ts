import { BaseSelectorData } from "../../../standalone";
interface ColourOptionsDef extends BaseSelectorData {
    color: string;
    type: string;
    isFixed?: boolean;
}
export declare const colourTypeOptions: {
    value: string;
    label: string;
}[];
export declare const colourOptions: ColourOptionsDef[];
export declare const flavourOptions: {
    value: string;
    label: string;
    rating: string;
}[];
export declare const stateOptions: {
    value: string;
    label: string;
}[];
export declare const optionLength: {
    value: number;
    label: string;
}[];
export declare const dogOptions: {
    id: number;
    label: string;
}[];
export declare const groupedOptions: ({
    label: string;
    options: ColourOptionsDef[];
} | {
    label: string;
    options: {
        value: string;
        label: string;
        rating: string;
    }[];
})[];
export {};
