import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';
// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

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
  include: {
    I: './steps_file'
  },
  name: 'codeceptjs-api-tests',
};
