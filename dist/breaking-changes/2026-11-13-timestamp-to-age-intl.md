# timestampToAge words the age with Intl.RelativeTimeFormat

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `timestampToAge`, so the age in `Notifications`' default row and `SignalPortlet`'s "Last refresh"; the `utils.timestampToAge.*` translation keys

## What changed

`timestampToAge` formats the age with `Intl.RelativeTimeFormat` in the current language of
the components-care i18n instance, instead of filling one singular and one plural word per unit
into a translated template.

- Every language gets its grammatical forms: "5 минут назад", "21 минуту назад", "2 часа назад"
  instead of "5 минуты назад", "21 минуты назад", "2 часы назад"; "2 uur geleden" instead of
  "2 uren geleden"; "2 kun oldin" instead of "2 kunlar oldin"; "il y a 5 jours" instead of
  "il y a 5 journées".
- Less than 5 seconds either way is "now" ("jetzt", "maintenant", …) instead of "just now"
  ("gerade jetzt", "juste maintenant", …).
- 5 to 59 seconds are counted, "30 seconds ago", instead of "Less than a minute ago".
- Weeks, months and years follow days: "1 week ago" from 7 days, "1 month ago" from 31 days,
  "1 year ago" from 365 days, instead of "400 days ago". A month is a twelfth of 365 days.
- A time in the future reads "in 2 hours" ("in 2 Stunden", "dans 2 heures", …) instead of
  "just now".
- The phrase is formatted for use within a sentence, so it starts in lowercase where the language
  does: "vor 5 Minuten", "il y a 5 minutes", "hace 5 minutos" instead of "Vor 5 Minuten",
  "Il y a 5 minutes", "Hace 5 minutos".
- An invalid date gives an empty string instead of "NaN days ago".
- The translation keys `utils.timestampToAge.just-now`, `.less-minute`, `.minute`, `.minutes`,
  `.hour`, `.hours`, `.day`, `.days` and `.str` are removed from every locale.

The wording comes from the browser's locale data. A browser without data for a language shows
the age the way it shows dates in that language: Chromium has no Uzbek data and shows "-2 d"
there, as it shows a date as "2026-03-17 12:00:00".

## Why

Russian needs three plural forms and the accusative after a number, Dutch and Uzbek use the
singular after a number, and French counts in "jours"; one singular and one plural word per unit
cannot express that. The template also had no future form and no unit above days.

## Migration

Nothing to do for the wording; expect the new texts in screenshots. An app that shows the age at
the start of a line gets a lowercase first letter in German, French and Spanish. An app that
overrides the `utils.timestampToAge.*` keys in the components-care i18n instance: the overrides
no longer have an effect.
