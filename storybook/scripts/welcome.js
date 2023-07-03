/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-console */
const prompts = require("prompts");
const dedent = require("ts-dedent").default;
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

// CLI questions
const questions = [
  {
    type: "text",
    name: "authorName",
    initial: "",
    message: "What is the package author name?*",
    validate: (name) => (name === "" ? "Name can't be empty" : true),
  },
  {
    type: "text",
    name: "authorEmail",
    initial: "",
    message: "What is the package author email?",
  },
  {
    type: "text",
    name: "packageName",
    message: "What is the addon package name (eg: storybook-addon-something)?*",
    validate: (name) => (name === "" ? "Package name can't be empty" : true),
  },
  {
    type: "text",
    name: "displayName",
    message:
      "What is the addon display name (this will be used in the addon catalog)?*",
    validate: (name) =>
      name === ""
        ? "Display name can't be empty. For more info, see: https://storybook.js.org/docs/react/addons/addon-catalog#addon-metadata"
        : true,
  },
  {
    type: "text",
    name: "addonDescription",
    initial: "",
    message: "Write a short description of the addon*",
    validate: (name) => (name === "" ? "Description can't be empty" : true),
  },
  {
    type: "text",
    name: "repoUrl",
    message: "Git repo URL for your addon package (https://github.com/...)*",
    validate: (url) => (url === "" ? "URL can't be empty" : true),
  },
  {
    type: "text",
    name: "addonIcon",
    initial:
      "https://user-images.githubusercontent.com/321738/63501763-88dbf600-c4cc-11e9-96cd-94adadc2fd72.png",
    message: "URL of your addon icon",
  },
  {
    type: "list",
    name: "keywords",
    initial: "storybook-addons",
    message: "Enter addon keywords (comma separated)",
    separator: ",",
    format: (keywords) =>
      keywords
        .concat(["storybook-addons"])
        .map((k) => `"${k}"`)
        .join(", "),
  },
  {
    type: "list",
    name: "supportedFrameworks",
    initial:
      "react, vue, angular, web-components, ember, html, svelte, preact, react-native",
    message: "List of frameworks you support (comma separated)?",
    separator: ",",
    format: (frameworks) => frameworks.map((k) => `"${k}"`).join(", "),
  },
];

const REPLACE_TEMPLATES = {
  packageName: "storybook-addon-kit",
  addonDescription: "everything you need to build a Storybook addon",
  packageAuthor: "package-author",
  repoUrl: "https://github.com/storybookjs/storybook-addon-kit",
  keywords: `"storybook-addons"`,
  displayName: "Addon Kit",
  supportedFrameworks: `"supported-frameworks"`,
};

const bold = (message) => `\u001b[1m${message}\u001b[22m`;
const magenta = (message) => `\u001b[35m${message}\u001b[39m`;
const blue = (message) => `\u001b[34m${message}\u001b[39m`;

const main = async () => {
  console.log(
    bold(
      magenta(
        dedent`
        Welcome to Storybook addon-kit!
        Please answer the following questions while we prepare this project for you:\n
      `
      )
    )
  );

  const {
    authorName,
    authorEmail,
    packageName,
    addonDescription,
    repoUrl,
    displayName,
    keywords,
    supportedFrameworks,
  } = await prompts(questions);

  if (!authorName || !packageName) {
    console.log(
      `\nProcess canceled by the user. Feel free to run ${bold(
        "yarn postinstall"
      )} to execute the installation steps again!`
    );
    process.exit(0);
  }

  const authorField = authorName + (authorEmail ? ` <${authorEmail}>` : "");

  const packageJson = path.resolve(__dirname, `../package.json`);

  console.log(`\n👷 Updating package.json...`);
  let packageJsonContents = fs.readFileSync(packageJson, "utf-8");

  packageJsonContents = packageJsonContents
    .replace(REPLACE_TEMPLATES.packageName, packageName)
    .replace(REPLACE_TEMPLATES.addonDescription, addonDescription)
    .replace(REPLACE_TEMPLATES.packageAuthor, authorField)
    .replace(REPLACE_TEMPLATES.keywords, keywords)
    .replace(REPLACE_TEMPLATES.repoUrl, repoUrl)
    .replace(REPLACE_TEMPLATES.displayName, displayName)
    .replace(REPLACE_TEMPLATES.supportedFrameworks, supportedFrameworks)
    .replace(/\s*"postinstall".*node.*scripts\/welcome.js.*",/, '');

  fs.writeFileSync(packageJson, packageJsonContents);

  console.log("📝 Updating the README...");
  const readme = path.resolve(__dirname, `../README.md`);
  let readmeContents = fs.readFileSync(readme, "utf-8");

  const regex = /<\!-- README START -->([\s\S]*)<\!-- README END -->/g;

  readmeContents = readmeContents.replace(
    regex,
    dedent`
    # Storybook Addon ${displayName}
    ${addonDescription}
    `
  );

  fs.writeFileSync(readme, readmeContents);

  console.log(`📦 Creating a commit...`);
  execSync('git add . && git commit -m "project setup" --no-verify');

  console.log(
    dedent`\n
      🚀 All done! Run \`yarn start\` to get started.

      Thanks for using this template, ${authorName.split(" ")[0]}! ❤️

      Feel free to open issues in case there are bugs/feature requests at:

      ${bold(blue("https://github.com/storybookjs/addon-kit"))}\n
    `
  );
};

main().catch((e) => console.log(`Something went wrong: ${e}`));
