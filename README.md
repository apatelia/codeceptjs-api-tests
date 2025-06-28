## About

This repository contains an automated test framework example for API Testing. The framework uses [codeceptjs](https://codecept.io/).

## How to run tests

1. Download the zip file or clone this repository.
2. Change the directory to `codeceptjs-api-tests`.

   ```sh
   cd codeceptjs-api-tests
   ```

3. Install dependencies.

   ```sh
   npm install
   ```

4. Run tests.

   ```sh
   # Run all the tests/scenarios.
   npm run test

   # Run all tests with @booking tag.
   npm codeceptjs run --grep "@booking" --steps

   # Run all tests with @users tag.
   npm codeceptjs run --grep "@users" --steps

   # Run all tests with @starwars tag.
   npm codeceptjs run --grep "@starwars" --steps
   ```

7. An HTML report is saved in `reports` directory after a successful test run.
