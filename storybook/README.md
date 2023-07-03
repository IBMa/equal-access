# Storybook Addon Equal Access Accessibility Checker
TBD

### Development scripts

- `yarn start` runs babel in watch mode and starts Storybook
- `yarn build` build and package your addon code

### Switch from TypeScript to JavaScript

Don't want to use TypeScript? We offer a handy eject command: `yarn eject-ts`

This will convert all code to JS. It is a destructive process, so we recommended running this before you start writing any code.

## What's included?

![Demo](https://user-images.githubusercontent.com/42671/107857205-e7044380-6dfa-11eb-8718-ad02e3ba1a3f.gif)

The addon code lives in `src`. It demonstrates all core addon related concepts. The three [UI paradigms](https://storybook.js.org/docs/react/addons/addon-types#ui-based-addons)

- `src/Tool.tsx`
- `src/Panel.tsx`
- `src/Tab.tsx`

Which, along with the addon itself, are registered in `src/manager.ts`.

Managing State and interacting with a story:

- `src/withGlobals.ts` & `src/Tool.tsx` demonstrates how to use `useGlobals` to manage global state and modify the contents of a Story.
- `src/withRoundTrip.ts` & `src/Panel.tsx` demonstrates two-way communication using channels.
- `src/Tab.tsx` demonstrates how to use `useParameter` to access the current story's parameters.

Your addon might use one or more of these patterns. Feel free to delete unused code. Update `src/manager.ts` and `src/preview.ts` accordingly.

Lastly, configure you addon name in `src/constants.ts`.

### Metadata

Storybook addons are listed in the [catalog](https://storybook.js.org/addons) and distributed via npm. The catalog is populated by querying npm's registry for Storybook-specific metadata in `package.json`. This project has been configured with sample data. Learn more about available options in the [Addon metadata docs](https://storybook.js.org/docs/react/addons/addon-catalog#addon-metadata).

## Release Management

### Setup

This project is configured to use [auto](https://github.com/intuit/auto) for release management. It generates a changelog and pushes it to both GitHub and npm. Therefore, you need to configure access to both:

- [`NPM_TOKEN`](https://docs.npmjs.com/creating-and-viewing-access-tokens#creating-access-tokens) Create a token with both _Read and Publish_ permissions.
- [`GH_TOKEN`](https://github.com/settings/tokens) Create a token with the `repo` scope.

Then open your `package.json` and edit the following fields:

- `name`
- `author`
- `repository`

#### Local

To use `auto` locally create a `.env` file at the root of your project and add your tokens to it:

```bash
GH_TOKEN=<value you just got from GitHub>
NPM_TOKEN=<value you just got from npm>
```

Lastly, **create labels on GitHub**. You’ll use these labels in the future when making changes to the package.

```bash
npx auto create-labels
```

If you check on GitHub, you’ll now see a set of labels that `auto` would like you to use. Use these to tag future pull requests.

#### GitHub Actions

This template comes with GitHub actions already set up to publish your addon anytime someone pushes to your repository.

Go to `Settings > Secrets`, click `New repository secret`, and add your `NPM_TOKEN`.

### Creating a release

To create a release locally you can run the following command, otherwise the GitHub action will make the release for you.

```sh
yarn release
```

That will:

- Build and package the addon code
- Bump the version
- Push a release to GitHub and npm
- Push a changelog to GitHub
