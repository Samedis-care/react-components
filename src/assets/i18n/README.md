# Localization

Localization is done here: https://localize.samedis.care/projects/components-care/


## Adding new languages

1. Create a new folder with the language code
2. Create a file `translation.json` inside the newly created folder with content `{}`
3. Use `scripts/make_country_data.py` to create the other files
   - `cd <project-root>/scripts`
   - `python3 make_country_data.py`
4. Register the MUI localization in `src/standalone/LocalizedDateTimePickers/useMuiLocaleData` if applicable
   - https://mui.com/x/react-date-pickers/localization/ 
   - https://github.com/mui/mui-x/tree/master/packages/x-date-pickers/src/locales