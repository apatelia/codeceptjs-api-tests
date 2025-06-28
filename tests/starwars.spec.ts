Feature('Star Wars API').tag('@starwars');

import { schema } from '../schemas/starwars-results.schema';

const host = 'https://www.swapi.tech/api';

Scenario('Get People', async ({ I }) => {
  await I.sendGetRequest(`${host}/people`);
  I.seeResponseCodeIs(200);

  I.seeResponseMatchesJsonSchema(schema);
});

Scenario('Get Planets', async ({ I }) => {
  await I.sendGetRequest(`${host}/planets`);
  I.seeResponseCodeIs(200);

  I.seeResponseMatchesJsonSchema(schema);
});
