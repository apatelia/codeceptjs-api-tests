Feature('Star Wars API').tag('@starwars');

import { schema } from '../schemas/starwars-results.schema';

const host = 'https://www.swapi.tech/api';

Scenario('Get People', async ({ I }) => {
  const response = await I.sendGetRequest(`${host}/people`);
  I.seeResponseCodeIs(200);

  I.seeResponseMatchesJsonSchema(schema);

  const nextLink = response.data.next;
  I.assertMatchRegex(nextLink, /^https:\/\/www\.swapi\.tech\/api\/[a-z]+(\?page=\d&limit=\d{1,2})?/);
});

Scenario('Get Planets', async ({ I }) => {
  const response = await I.sendGetRequest(`${host}/planets`);
  I.seeResponseCodeIs(200);

  I.seeResponseMatchesJsonSchema(schema);

  const nextLink = response.data.next;
  I.assertMatchRegex(nextLink, /^https:\/\/www\.swapi\.tech\/api\/[a-z]+(\?page=\d&limit=\d{1,2})?/);
});
