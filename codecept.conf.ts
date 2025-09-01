import { setCommonPlugins } from '@codeceptjs/configure';

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

export const config: CodeceptJS.MainConfig = {
  tests: './tests/**.spec.ts',
  output: './reports',
  helpers: {
    REST: {
      endpoint: 'https://reqres.in',
    },
    JSONResponse: {},
    'ExpectHelper': {
      'require': '@codeceptjs/expect-helper'
    },
    'ApiHelper': {
      require: './helpers/api-helper.ts'
    }
  },
  'mocha': {
    'reporterOptions': {
      'codeceptjs-cli-reporter': {
        'stdout': '-',
        'options': {
          'steps': true,
        }
      },
      'mochawesome': {
        'stdout': '-',
        'options': {
          'reportDir': './reports',
          'reportFilename': 'report',
          'json': false,
        }
      }
    }
  },
  plugins: {
    parallelReport: {
      enabled: true,
      require: './parallel-reporter/index.ts',
      projectName: 'CodeceptJS API Tests'
    }
  },
  include: {
    I: './steps_file'
  },
  name: 'codeceptjs-api-tests',
};
