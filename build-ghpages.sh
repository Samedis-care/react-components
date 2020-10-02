#!/bin/bash

set -e

npm run docgen
cp -r docs/* "$2"
npm run build-storybook -- -o "$2/storybook"
