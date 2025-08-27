module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverage: true,
    mapCoverage: true
    // transformIgnorePatterns: [
    //     "ace-node\\.js"
    // ]
};

/*
    "preset": "ts-jest",
    "transformIgnorePatterns": [
      "ace-node\\.js"
    ],
    "transform": {
      "^.+\\.ts$": "ts-jest"
    }
*/