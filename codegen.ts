import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:8080/graphql',
  documents: ['lib/**/*.ts'],
  verbose: true,
  ignoreNoDocuments: true,
  generates: {
    './lib/generated/': {
      preset: 'client'
    }
  }
};

export default config;
