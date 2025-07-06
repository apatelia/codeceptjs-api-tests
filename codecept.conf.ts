import { setCommonPlugins } from '@codeceptjs/configure';

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

export const config: CodeceptJS.MainConfig = {
  tests: './tests/**.spec.ts',
  output: './reports',
  helpers: {
    REST: {
      endpoint: 'https://reqres.in'
    },
    JSONResponse: {},
    'JsonExtendedHelper': {
      require: './helpers/json-extended-helper.ts'
    },
    'ChaiWrapper': {
      'require': 'codeceptjs-chai'
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
    ParallelReport: {
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
