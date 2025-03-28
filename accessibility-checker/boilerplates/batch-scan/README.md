# batch-scan

Scanning a batch of HTML files in a repeatable fashion is a level of automation beyond using the command-line to scan a list of URLs or using the browser's DevTools extension to manually scan and store a multi-scan report:
- See [Extensions](https://github.com/IBMa/equal-access/wiki#extensions) for the list of browser extensions supported to interactively scan multiple pages, states, and store a multi-scan report.
- See [Command-Line multi-scan](https://github.com/IBMa/equal-access/wiki#scanning-multiple-pages) for information about one-time scanning a list of files, directories, or a list of URLs generated from a web crawler.

This boilerplate shows how a local set of HTML files can be repeatedly scanned and the results saved.

### Purpose of files in this boilerplate

**main.js** - In summary, this JavaScript code uses the `accessibility-checker` library to scan HTML files for accessibility issues,
and logs the results to the console
Here's a breakdown of what the code does:

- The `accessibility-checker` library is imported as aChecker
- An array named `sampNames` is defined, containing strings representing the names of HTML files to be scanned. Note that although some sample names are repeated, suggesting that the same HTML file might be scanned multiple times, the file names are repeated in this boilerplate simply as a filler. The same file would have to be changed dynamically to have different results reported.
- An asynchronous function is defined using an immediately invoked arrow function (IIFE). This function performs the accessibility checks.
- Inside the IIFE, a variable `idx` is initialized to keep track of the index for appending unique identifiers to the filenames.
- The `Promise.all()` method is used to run multiple promises concurrently. It takes an array of promises as its argument. In this case, the array is generated by mapping over the sampNames array.
- For each name in `sampNames`, a promise is created using `aChecker.getCompliance()`. This method checks the accessibility compliance of an HTML file.
- The HTML file path is constructed using the current working directory `(process.cwd())` and the _sample name_ with a unique _index_ appended.
- Once all promises are resolved, the results are stored in the results variable.
- The `aChecker.close()` method is called to release any resources used by the `accessibility-checker` library.
- A success message is logged to the console, indicating the number of pages scanned.
- If an error occurs during the scanning process, it is caught and logged to the console using `console.error(err)`.

**package.json** - In summary, this file defines a Node.js project with a specific entry point, version, description, and dependencies. It also includes a custom script for testing the Node.js project named "@ibma/aat-boilerplate". Here's a breakdown of its contents:
- `name`: The name of the project is "`@ibma/aat-boilerplate`.
- `version`: The version of the project is `3.0.0`.
- `description`: The brief description of the project which is "Example usage of accessibility checker in batch scans".
- `main`: The entry point of the application is `src/app.js`.
- `scripts`: The section containing custom commands that can be run using `npm run`. In this case, there's only one script named "test" that runs the command `node main.js`.
- `engines`: The section specifying the required Node.js version for the project, which is ">=10".
- `devDependencies`: The section listing the development dependencies of the project. In this case, there's only one dependency, `accessibility-checker`, which is the local file located at "../../src".

**sample1.html** - A sample HTML file to be scanned. 

## Baseline basics

See the [Baseline basics](https://github.com/IBMa/equal-access/wiki#baseline-basics) topic in the Wiki to get started comparing scans over time and to prevent new issues from being introduced.
