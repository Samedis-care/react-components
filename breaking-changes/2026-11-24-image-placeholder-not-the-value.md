# An image field's placeholder is no longer its value

- **Date:** 2026-11-24
- **Kind:** behavior
- **Scope:** `ModelDataTypeImageRenderer` with a `placeholder`, in editable form fields;
  `standalone/FileUpload/Image` (`ImageSelector`, new prop `placeholder`)

## What changed

- `ImageSelector` takes a `placeholder`: an image URL or data URI drawn while `value` is
  empty, where the picture would be. It looks as a placeholder passed as the value did:
  - modern: framed like a picture, with the upload button (and the camera button, with
    `capture`) in its corner, and the same hover hint;
  - normal: in the image area below the buttons;
  - profile_picture: in the avatar, in place of the person icon.
- But it is not the field's image:
  - its `alt` is empty, so assistive technology skips it, and the hover hint does not name
    it;
  - in modern, a click on it opens the file dialog (in a read-only field nothing), not the
    full-screen preview.
- `ModelDataTypeImageRenderer` passes `params.placeholder` to that prop, and the empty value
  as the value. It used to pass the placeholder as the field's value, so an empty editable
  field showed it as a stored picture: a click opened the preview, and it was announced as
  the field's picture.
- Grid cells and fields that only show the picture are unchanged ("No image present").

## Why

A screen reader announced an empty image field with a placeholder like one with a stored
picture, and a click on the placeholder opened it in the full-screen zoom and rotate preview
instead of letting the user add a picture.

## Migration

- Nothing is required for fields that set `params.placeholder`.
- **Required for** an app that passes a generic placeholder as an image field's value
  instead, for example a custom renderer that falls back to a placeholder URL when the record
  has no picture: pass that URL as `params.placeholder` (or as `ImageSelector`'s
  `placeholder`) and the empty value as the value. Otherwise that field keeps announcing the
  placeholder as its picture and opening it in the preview.

  ```ts
  // before: the placeholder reaches the selector as the value
  super.render({ ...params, value: params.value || "/img/no-photo.svg" });

  // after: the renderer is created with the placeholder, the value stays empty
  new ModelDataTypeImageRenderer({ placeholder: "/img/no-photo.svg" });
  ```

  A fallback that is a real picture of the record (another field's image) is a value, not a
  placeholder, and stays as it is.

- Tests that find an editable field's placeholder by role `img` or by its alt text find
  nothing now (empty alt); look it up by its `src`.
