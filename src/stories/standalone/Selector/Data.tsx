// source: https://codesandbox.io/s/ug4oh?module=/docs/data.js, modified for additional features

import React from "react";
import { BaseSelectorData } from "../../../standalone";
import { Warning, Error, Info, Alarm } from "@material-ui/icons";

interface ColourOptionsDef extends BaseSelectorData {
	color: string;
	type: string;
	isFixed?: boolean;
}

export const colourTypeOptions = [
	{
		value: "Dark",
		label: "Dark",
	},
	{
		value: "Light",
		label: "Light",
	},
];

export const colourOptions: ColourOptionsDef[] = [
	{
		value: "ocean",
		label: "Ocean",
		color: "#00B8D9",
		type: "Light",
		isFixed: true,
		icon: <Warning />,
	},
	{
		value: "blue",
		label: "Blue",
		color: "#0052CC",
		type: "Dark",
		isDisabled: true,
		icon: <Error />,
	},
	{
		value: "purple",
		label: "Purple",
		color: "#5243AA",
		type: "Dark",
		icon: <Info />,
	},
	{
		value: "red",
		label: "Red",
		color: "#FF5630",
		type: "Dark",
		isFixed: true,
		icon: <Alarm />,
	},
	{
		value: "orange",
		label: "Orange",
		color: "#FF8B00",
		type: "Light",
		icon: <Warning />,
	},
	{
		value: "yellow",
		label: "Yellow",
		color: "#FFC400",
		type: "Light",
		icon: <Error />,
	},
	{
		value: "green",
		label: "Green",
		color: "#36B37E",
		type: "Light",
		icon: <Info />,
	},
	{
		value: "forest",
		label: "Forest",
		color: "#00875A",
		type: "Dark",
		icon: "https://via.placeholder.com/512x128",
	},
	{
		value: "slate",
		label: "Slate",
		color: "#253858",
		type: "Light",
		icon: "https://via.placeholder.com/128x512",
	},
	{
		value: "silver",
		label: "Silver",
		color: "#666666",
		type: "Light",
		icon: "https://via.placeholder.com/512",
	},
	{
		value: "long-test",
		label:
			"This is an extremely long label which is used for testing purposes. It may be too long to fit in a single line, but this is exactly what we want here as we want to test overflow handling",
		color: "#666666",
		type: "Other",
		icon: "https://via.placeholder.com/512",
	},
];

export const flavourOptions = [
	{ value: "vanilla", label: "Vanilla", rating: "safe" },
	{ value: "chocolate", label: "Chocolate", rating: "good" },
	{ value: "strawberry", label: "Strawberry", rating: "wild" },
	{ value: "salted-caramel", label: "Salted Caramel", rating: "crazy" },
];

export const stateOptions = [
	{ value: "AL", label: "Alabama" },
	{ value: "AK", label: "Alaska" },
	{ value: "AS", label: "American Samoa" },
	{ value: "AZ", label: "Arizona" },
	{ value: "AR", label: "Arkansas" },
	{ value: "CA", label: "California" },
	{ value: "CO", label: "Colorado" },
	{ value: "CT", label: "Connecticut" },
	{ value: "DE", label: "Delaware" },
	{ value: "DC", label: "District Of Columbia" },
	{ value: "FM", label: "Federated States Of Micronesia" },
	{ value: "FL", label: "Florida" },
	{ value: "GA", label: "Georgia" },
	{ value: "GU", label: "Guam" },
	{ value: "HI", label: "Hawaii" },
	{ value: "ID", label: "Idaho" },
	{ value: "IL", label: "Illinois" },
	{ value: "IN", label: "Indiana" },
	{ value: "IA", label: "Iowa" },
	{ value: "KS", label: "Kansas" },
	{ value: "KY", label: "Kentucky" },
	{ value: "LA", label: "Louisiana" },
	{ value: "ME", label: "Maine" },
	{ value: "MH", label: "Marshall Islands" },
	{ value: "MD", label: "Maryland" },
	{ value: "MA", label: "Massachusetts" },
	{ value: "MI", label: "Michigan" },
	{ value: "MN", label: "Minnesota" },
	{ value: "MS", label: "Mississippi" },
	{ value: "MO", label: "Missouri" },
	{ value: "MT", label: "Montana" },
	{ value: "NE", label: "Nebraska" },
	{ value: "NV", label: "Nevada" },
	{ value: "NH", label: "New Hampshire" },
	{ value: "NJ", label: "New Jersey" },
	{ value: "NM", label: "New Mexico" },
	{ value: "NY", label: "New York" },
	{ value: "NC", label: "North Carolina" },
	{ value: "ND", label: "North Dakota" },
	{ value: "MP", label: "Northern Mariana Islands" },
	{ value: "OH", label: "Ohio" },
	{ value: "OK", label: "Oklahoma" },
	{ value: "OR", label: "Oregon" },
	{ value: "PW", label: "Palau" },
	{ value: "PA", label: "Pennsylvania" },
	{ value: "PR", label: "Puerto Rico" },
	{ value: "RI", label: "Rhode Island" },
	{ value: "SC", label: "South Carolina" },
	{ value: "SD", label: "South Dakota" },
	{ value: "TN", label: "Tennessee" },
	{ value: "TX", label: "Texas" },
	{ value: "UT", label: "Utah" },
	{ value: "VT", label: "Vermont" },
	{ value: "VI", label: "Virgin Islands" },
	{ value: "VA", label: "Virginia" },
	{ value: "WA", label: "Washington" },
	{ value: "WV", label: "West Virginia" },
	{ value: "WI", label: "Wisconsin" },
	{ value: "WY", label: "Wyoming" },
];

export const optionLength = [
	{ value: 1, label: "general" },
	{
		value: 2,
		label:
			"Evil is the moment when I lack the strength to be true to the Good that compels me.",
	},
	{
		value: 3,
		label:
			"It is now an easy matter to spell out the ethic of a truth: 'Do all that you can to persevere in that which exceeds your perseverance. Persevere in the interruption. Seize in your being that which has seized and broken you.",
	},
];

export const dogOptions = [
	{ id: 1, label: "Chihuahua" },
	{ id: 2, label: "Bulldog" },
	{ id: 3, label: "Dachshund" },
	{ id: 4, label: "Akita" },
];

// let bigOptions = [];
// for (let i = 0; i < 10000; i++) {
// 	bigOptions = bigOptions.concat(colourOptions);
// }

export const groupedOptions = [
	{
		label: "Colours",
		options: colourOptions,
	},
	{
		label: "Flavours",
		options: flavourOptions,
	},
];
