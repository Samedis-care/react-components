# Components.care React

## Installing

> `npm install "git://github.com/Samedis-care/react-components.git#master_dist" --save --legacy-peer-deps`

> `yarn add "git://github.com/Samedis-care/react-components.git#master_dist"`

Note: Make sure to install all peer-dependencies

## Overview

The aim of this project is to provide a solid foundation for developing complex React based web applications.

There are 5 types of components you will find here:

- Standalone Components
  > Standalone Components are designed to run without any further integration of the Components.care framework and can be used as an extension of your existing UI libraries.
  > 
  > WARNING: If not using the Components-Care Framework you still need to add CCI18nProvider to your render tree for localization 
- Application Framework
  > The Application Framework provides you with a set of pre-configured common libraries to enable you rapid development of new applications and our own simple routing solution
- Non-standalone Components
  > UI Components based off the application framework
- Backend Integration
  > Backend Integration provides automatic data management and a backend communication layer
- Backend Components
  > Backend Components are UI components with Backend integration

Used Libraries:

- Material-UI (Used as base for UI components)
- i18n (Used to provide pre-translated components)
- moment.js (Used for localized date/time related components)
- react-query (Used as backend connector/caching layer)
- react-window (Used for DOM virtualization)
- [Sentry](https://sentry.io) (optional integration)

## Developer Setup

### Running the developer environment (Storybook)

1. Run `npx --no-install npm@8.1.2 install --force`
2. Run `npm start`

### Path overview

- `src/`: Generic configuration files
- `src/assets`: Assets bundled by Webpack
- `src/utils`: Utility functions
- `src/standalone`: Standalone components
- `src/framework`: Framework components
- `src/non-standalone`: Non-standalone components
- `src/backend-integration`: Backend-integration components
- `src/backend`: Backend components

### Building the source code

1. Run `npm install`
2. Run `npm build`
3. You'll find the output files under `dist/`

### Using developer mode in your Create-React-App Webapp

Using this mode you can perform changes in Components-Care and instantly preview them in your application.

In your Webapp:
1. Install Components-Care
2. `mkdir src/node_modules`
3. `mv node_modules/components-care src/node_modules`
4. `rm -rf src/node_modules/dist`

In Components-Care:
1. Start TSC in watch mode `tsc --watch --outDir <path-to-your-webapp>/src/node_modules/components-care/dist`
2. Copy assets in watch mode `cpx -w 'src/assets/**/*' <path-to-your-webapp>/src/node_modules/components-care/dist/assets`

Now run the development server `npm start` / `yarn dev` in your Webapp. Components-Care code changes are automatically applied to your webapp, using the normal hot reload functionality.
