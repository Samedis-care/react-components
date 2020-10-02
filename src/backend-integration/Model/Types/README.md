# Types

## Purpose

Types provide some basic validation and metadata about data types. They are separated from [renderers](Renderers/README.md) for code deduplication reasons.

## Implementation

Types extend the base [Type class](../Type.ts) and implement everything except the render function.
