module.exports = {
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testPathIgnorePatterns: [ 
        "/node_modules/",
        "/dist/"
    ]
};