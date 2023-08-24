module.exports = {
    "moduleNameMapper": {
        // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
        // Note that this comes through the exceljs module
        "uuid": require.resolve('uuid'),
        "axios": require.resolve('axios')
    },
    "setupFilesAfterEnv": [
        "./setupAfterEnv.js"
      ],
    "resolver": "jest-pnp-resolver",
    "testEnvironment": "jsdom",
    "transformIgnorePatterns": ["ace-node\\.js"]
}