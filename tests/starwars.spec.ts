Feature('Star Wars API').tag('@starwars');

import { z } from 'zod';
import { schema } from '../schemas/starwars-results.schema';

const host = 'https://www.swapi.tech/api';

Scenario('Get People', async ({ I }) => {
  const response = await I.sendGetRequest(`${host}/people`);
  I.seeResponseCodeIs(200);

  I.seeResponseMatchesFullJsonSchema(schema);

  const nextLink = response.data.next;
  const linkRegex = /^https:\/\/www\.swapi\.tech\/api\/[a-z]+(\?page=\d&limit=\d{1,2})?/;
  I.expectMatchRegex(nextLink, linkRegex);
});

Scenario('Get Planets', async ({ I }) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  I.sendGetRequest(`${host}/planets`); // No await here, as codeceptjs will automatically wait for the request to complete.
  I.seeResponseCodeIs(200);
  I.seeResponseContentTypeIs('application/json');

  // Partial schema that only defines a part of the response structure.
  const socialSchema = z.object({
    discord: z.url().optional(),
    reddit: z.url().optional(),
    github: z.url().optional(),
  });

  // * Validate response against only partially defined schema
  I.seeResponseMatchesPartialJsonSchema(socialSchema);

  // * Validate response against full schema using the PartialJsonSchemaValidator Helper
  // ! Any unexpected fields in the response will be ignored.
  I.seeResponseMatchesPartialJsonSchema(schema);

  // * Validate response against full schema
  // ! This will fail if there are any unexpected fields in the response.
  I.seeResponseMatchesFullJsonSchema(schema);

  // * Grab the 'next' link from the response.
  // * 'await' is used here to ensure that the value is retrieved before the next assertion.
  const nextLink = await I.grabFieldFromResponse('next');
  const linkRegex = /^https:\/\/www\.swapi\.tech\/api\/[a-z]+(\?page=\d&limit=\d{1,2})?/;
  I.expectMatchRegex(nextLink, linkRegex);
});
