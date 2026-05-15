#!/bin/bash

set -e

pnpm run docgen
cp -r typedoc/* "$2"
pnpm run build-storybook -- -o "$2/storybook"
