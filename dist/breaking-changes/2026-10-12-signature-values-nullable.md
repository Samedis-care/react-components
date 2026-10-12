# Signature values can be null

- **Date:** 2026-10-12
- **Kind:** type
- **Scope:** `backend-integration/Model/Types` (`TypeSignature`, the signature renderer), `standalone/SignPad`, `non-standalone/Dialog` (`SignPadDialog` props)

## What changed

`TypeSignature` holds `string | null`, and the `signature` props of `SignPad` and the sign pad
dialog take `string | null`.

## Why

An unsigned field is null when the server sends it or a form clears it, which the controls
already handled.

## Migration

Code reading a signature field gets `string | null`: handle the unsigned case where it reads one.
