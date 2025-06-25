#!/usr/bin/python3

import os
import json
import requests
import csv
import io

def download_flags(country_list: [str]):
    for country_code in country_list:
        dl_path = "../src/assets/img/countries/" + country_code + ".svg"
        if os.path.isfile(dl_path):
            continue
        print("Downloading country flag", country_code)
        r = requests.get("https://raw.githubusercontent.com/smucode/react-world-flags/master/src/svgs/" + country_code.lower() + ".svg")
        if r.ok:
            with open(dl_path, "wb") as f:
                f.write(r.content)
                f.flush()
        else:
            print("ERROR:", r)
            open(dl_path, "wb").close() # create file so we don't try downloading again
            # raise ValueError("Response is not okay!")

# returns country_code -> language array
def get_country_languages() -> dict[str, [str]]:
    country_lang_mapping_data = requests.get("http://download.geonames.org/export/dump/countryInfo.txt").text
    with io.StringIO(country_lang_mapping_data) as lang_mapping_stream:
        tsv_reader = csv.reader(lang_mapping_stream, delimiter="\t")
        country_lang_mapping = {}
        for row in tsv_reader:
            if row[0].startswith("#"):
                continue
            country_code, languages = row[0], row[15]
            # list of unsupported countries
            if country_code == "AN":
                continue
            languages = [lang.split("-")[0] for lang in languages.split(",")]
            country_lang_mapping[country_code] = languages
        return country_lang_mapping

# returns locale -> country_code -> localized string
def read_countries() -> dict[str, dict[str, str]]:
    ret = {}
    locales = os.listdir("../node_modules/cldr-data/main/")
    for locale in locales:
        with open("../node_modules/cldr-data/main/" + locale + "/territories.json", "r") as f:
            ret[locale] = json.load(f)["main"][locale]["localeDisplayNames"]["territories"]
    ret["ru-KG"]["KG"] = "Кыргызстан" # upon special request by the govt of Кыргызстан
    return ret

# returns locale -> language code -> localized string
def read_languages() -> dict[str, dict[str, str]]:
    ret = {}
    locales = os.listdir("../node_modules/cldr-data/main/")
    for locale in locales:
        with open("../node_modules/cldr-data/main/" + locale + "/languages.json", "r") as f:
            ret[locale] = json.load(f)["main"][locale]["localeDisplayNames"]["languages"]
    return ret


# locale -> num speakers
def locale_relevance() -> dict[str, int]:
    ret = {}
    with open("../node_modules/cldr-data/supplemental/territoryInfo.json") as f:
        data = json.load(f)["supplemental"]["territoryInfo"]
    for country, data in data.items():
        population = int(data["_population"])
        if "languagePopulation" not in data:
            continue
        for lang, lang_data in data["languagePopulation"].items():
            speaker_count = population * (float(lang_data["_populationPercent"]) / 100)
            ret[lang + "-" + country] = int(speaker_count)
    return ret

# list of all currencies
def get_currencies() -> list[str]:
    with open("../node_modules/cldr-data/main/en/currencies.json") as f:
        data = json.load(f)["main"]["en"]["numbers"]["currencies"]
    return list(data.keys())

# locale -> currency -> { displayName: string, displayName-count-one: string, displayName-count-other: string, symbol: string, symbol-alt-narrow?: string }
def get_currency_locales() -> dict[str, dict[str, dict[str, str]]]:
    ret = {}
    locales = os.listdir("../node_modules/cldr-data/main/")
    for locale in locales:
        with open("../node_modules/cldr-data/main/" + locale + "/currencies.json", "r") as f:
            ret[locale] = json.load(f)["main"][locale]["numbers"]["currencies"]
    return ret

# list of alive currencies (currently in use)
def get_currencies_alive() -> list[str]:
    alive_currencies = set()
    with open("../node_modules/cldr-data/supplemental/currencyData.json", "r") as f:
        data = json.load(f)["supplemental"]["currencyData"]["region"]
    for region, currencies in data.items():
        for subCurrencies in currencies:
            for currency, currencyData in subCurrencies.items():
                if "_tender" in currencyData and currencyData["_tender"] == "false":
                    continue
                if "_to" not in currencyData:
                    alive_currencies.add(currency)
    return list(alive_currencies)

# currency formatting data. currency OR "DEFAULT" -> {_rounding: string, _digits: string, _cashRounding?: string, _cashDigits?: string}
def get_currency_formatting() -> dict[str, dict[str, str]]:
    with open("../node_modules/cldr-data/supplemental/currencyData.json", "r") as f:
        return json.load(f)["supplemental"]["currencyData"]["fractions"]

# currency -> number of people using it
def get_currency_users() -> dict[str, int]:
    currency_users = {}
    with open("../node_modules/cldr-data/supplemental/territoryInfo.json", "r") as f:
        territory_info = json.load(f)["supplemental"]["territoryInfo"]
    with open("../node_modules/cldr-data/supplemental/currencyData.json", "r") as f:
        currency_data = json.load(f)["supplemental"]["currencyData"]["region"]
    for region, currencies in currency_data.items():
        for subCurrencies in currencies:
            for currency, currencyData in subCurrencies.items():
                if "_tender" in currencyData and currencyData["_tender"] == "false":
                    continue
                if "_to" not in currencyData: # only alive currencies
                    if currency not in currency_users:
                        currency_users[currency] = 0
                    if region not in territory_info:
                        # no population info
                        continue
                    currency_users[currency] += int(territory_info[region]["_population"])
    currency_users = dict(sorted(currency_users.items(), key=lambda item: item[1]))
    return currency_users


def get_country_list() -> [str]:
    return list(requests.get("https://raw.githubusercontent.com/esosedi/3166/master/i18n/dispute/UN/en.json").json().keys())

# currency (lower case) -> {code: str, alphaCode: str, numericCode: str, name: str, rate: float, data: str, inverseRate: float }
def get_currency_exchange_rates():
    return requests.get("https://www.floatrates.com/daily/usd.json").json()

if __name__ == "__main__":
    supported_languages = os.listdir("../src/assets/i18n/")
    supported_languages = [folder for folder in supported_languages if os.path.isdir("../src/assets/i18n/" + folder)]
    country_languages = get_country_languages()
    countries = read_countries()
    languages = read_languages()
    locale_list = [lang + "-" + country for country, country_langs in country_languages.items() for lang in country_langs if lang != ""]
    print(locale_list, len(locale_list))
    country_list = get_country_list()
    download_flags(country_list)
    relevance = locale_relevance()
    supported_locales = set()
    currencies = get_currencies()
    currency_locales = get_currency_locales()
    currencies_alive = get_currencies_alive()
    currency_formatting = get_currency_formatting()
    currency_users = get_currency_users()
    currency_exchange_rates = get_currency_exchange_rates()
    with open("../src/assets/data/currencies.json", "w") as f:
        json.dump(currencies, f, indent=2, ensure_ascii=False)
    with open("../src/assets/data/currencies-alive.json", "w") as f:
        json.dump(currencies_alive, f, indent=2, ensure_ascii=False)
    with open("../src/assets/data/currency-formatting.json", "w") as f:
        currency_format = {}
        for currency in currencies:
            if currency in currency_formatting:
                formatting_options = currency_formatting[currency]
            else:
                formatting_options = currency_formatting["DEFAULT"]
            currency_format[currency] = {
                "rounding": int(formatting_options["_rounding"]),
                "digits": int(formatting_options["_digits"])
            }
        json.dump(currency_format, f, indent=2, ensure_ascii=False)
    with open("../src/assets/data/currencies-users.json", "w") as f:
        for currency in currencies:
            if currency not in currency_users:
                currency_users[currency] = 0
        json.dump(currency_users, f, indent=2, ensure_ascii=False)
    with open("../src/assets/data/currency-relevance.json", "w") as f:
        def get_currency_exchange_rate(currency: str) -> float:
            currency = currency.lower()
            if currency == "usd":
                return 1.0 # base
            if currency in currency_exchange_rates:
                return currency_exchange_rates[currency]["inverseRate"]
            return 0.0
        currency_relevance = {}
        for currency, users in currency_users.items():
            currency_relevance[currency] = int(users * get_currency_exchange_rate(currency))
        currency_relevance = dict(sorted(currency_relevance.items(), key=lambda item: item[1]))
        json.dump(currency_relevance, f, indent=2, ensure_ascii=False)
    with open("../src/assets/data/countries.json", "w") as f:
        json.dump(country_list, f, indent=2, ensure_ascii=False)
    with open("../src/standalone/CountryFlags/index.ts", "w") as f:
        f.write("// NOTICE: This file is generated by scripts/make_country_data.py! Do not modify!" + os.linesep)
        f.write(os.linesep)
        f.write("// Imports" + os.linesep)
        for country in country_list:
            f.write(f"import flag_{country} from \"../../assets/img/countries/{country}.svg\";" + os.linesep)
        f.write(os.linesep)
        f.write("// JS Object" + os.linesep)
        f.write("const CountryFlags: Record<string, string> = {" + os.linesep)
        for country in country_list:
            f.write(f"\t{country}: flag_{country}," + os.linesep)
        f.write("};" + os.linesep)
        f.write(os.linesep)
        f.write("export default CountryFlags;" + os.linesep)
    with open("../src/assets/data/country-languages.json", "w") as f:
        json.dump(country_languages, f, indent=2, ensure_ascii=False)
    with open("../src/assets/data/supported-languages.json", "w") as f:
        json.dump(supported_languages, f, indent=2, ensure_ascii=False)
    with open("../src/assets/data/locale-relevance.json", "w") as f:
        json.dump(relevance, f, indent=2, ensure_ascii=False)
    with open("../src/assets/data/languages.json", "w") as f:
        language_keys = set()
        for lang_code, name in languages["en"].items():
            if "-" in lang_code:
                continue
            if len(lang_code) != 2:
                continue
            language_keys.add(lang_code)
        language_keys = list(language_keys)
        language_keys.sort()
        json.dump(language_keys, f, indent=2, ensure_ascii=False)
    for lang in supported_languages:
        with open("../src/assets/i18n/" + lang + "/currencies.json", "w") as f:
            json.dump(currency_locales[lang], f, indent=2, ensure_ascii=False)
        with open("../src/assets/i18n/" + lang + "/countries.json", "w") as f:
            json.dump(countries[lang], f, indent=2, ensure_ascii=False)
        with open("../src/assets/i18n/" + lang + "/languages.json", "w") as f:
            languages_data = {}
            for lang_code, name in languages[lang].items():
                if "-" in lang_code:
                    continue
                if len(lang_code) != 2:
                    continue
                languages_data[lang_code] = name
                try:
                    languages_data[lang_code + "-native"] = languages[lang_code][lang_code]
                except KeyError as e:
                    print("Failed to find native data for", lang_code, e)
                    continue
            json.dump(languages_data, f, indent=2, ensure_ascii=False)
        with open("../src/assets/i18n/" + lang + "/locale-switcher.json", "w") as f:
            locale_switcher_data = {}
            for locale in locale_list:
                locale_split = locale.split("-", maxsplit=2)
                if len(locale_split) >= 2:
                    locale_lang, locale_country = locale_split[0], locale_split[1]
                else:
                    locale_lang = locale
                    locale_country = locale.upper()
                print(locale_lang + "-" + locale_country)
                my_locale_country_data = countries[lang]
                my_locale_language_data = languages[lang]
                try:
                    native_locale_country_data = countries[locale]
                    native_locale_language_data = languages[locale]
                except:
                    try:
                        native_locale_country_data = countries[locale_lang]
                        native_locale_language_data = languages[locale_lang]
                    except KeyError as e:
                        print("Failed to find native data for", locale, e)
                        continue
                try:
                    locale_switcher_data[locale_lang + "-" + locale_country] = {
                        "country": my_locale_country_data[locale_country],
                        "language": my_locale_language_data[locale_lang],
                        "native_country": native_locale_country_data[locale_country],
                        "native_language": native_locale_language_data[locale_lang]
                    }
                    supported_locales.add(locale_lang + "-" + locale_country)
                except KeyError as e:
                    print("Failed to find info for", locale, e)
            json.dump(locale_switcher_data, f, indent=2, ensure_ascii=False)
            # ensure all images are present (otherwise webpack will throw an error)
            download_flags([locale.split("-")[1] for locale in locale_switcher_data.keys()])
    supported_locales = list(supported_locales)
    supported_locales.sort()
    with open("../src/assets/data/supported-locales.json", "w") as f:
        json.dump(supported_locales, f, indent=2, ensure_ascii=False)
