const { jsWithTs: tsjPreset } = require('ts-jest/presets');
const { name } = require('./package.json');

module.exports = {
  displayName: name,
  name,
  verbose: true,
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    ...tsjPreset.transform,
  },
  moduleNameMapper: {
    '^sip\\.js(/.*)?$': '<rootDir>/test/mocks/sip.ts',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
    },
  },
};
