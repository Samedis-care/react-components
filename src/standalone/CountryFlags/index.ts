import countries from "../../assets/data/countries.json";

/**
 * Before accessing call initCountryFlags once in your application
 */
const CountryFlags: Record<string, string> = {};

/**
 * Initialize the CountryFlags
 */
export const initCountryFlags = async (): Promise<void> => {
	await Promise.all(
		countries.map(async (country) => {
			const { default: flag } = (await import(
				"../../assets/img/countries/" + country + ".svg"
			)) as Record<"default", string>;
			CountryFlags[country] = flag;
		})
	);
};

export default CountryFlags;
