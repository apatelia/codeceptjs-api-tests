Feature('Star Wars API').tag('@starwars');

import { schema } from '../schemas/starwars-results.schema';
import Joi from 'joi';

const host = 'https://www.swapi.tech/api';

Scenario('Get People', async ({ I }) => {
  const response = await I.sendGetRequest(`${host}/people`);
  I.seeResponseCodeIs(200);

  I.seeResponseMatchesJsonSchema(schema);

  const nextLink = response.data.next;
  const linkRegex = /^https:\/\/www\.swapi\.tech\/api\/[a-z]+(\?page=\d&limit=\d{1,2})?/;
  I.assertMatchRegex(nextLink, linkRegex);
});

Scenario('Get Planets', async ({ I }) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  I.sendGetRequest(`${host}/planets`); // No await here, as codeceptjs will automatically wait for the request to complete.
  I.seeResponseCodeIs(200);
  I.seeResponseContentTypeIs('application/json');

  // Partial schema that only defines a part of the response structure.
  const socialSchema = Joi.object({
    discord: Joi.string().uri(),
    reddit: Joi.string().uri(),
    github: Joi.string().uri(),
  });

  // * Validate response against only partially defined schema
  I.seeResponseMatchesPartialJsonSchema(socialSchema);

  // * Validate response against full schema using the PartialJsonSchemaValidator Helper
  // ! Any unexpected fields in the response will be ignored.
  I.seeResponseMatchesPartialJsonSchema(schema);

  // * Validate response against full schema
  // ! This will fail if there are any unexpected fields in the response.
  I.seeResponseMatchesJsonSchema(schema);

  // * Grab the 'next' link from the response.
  // * 'await' is used here to ensure that the value is retrieved before the next assertion.
  const nextLink = await I.grabFieldFromResponse('next');
  const linkRegex = /^https:\/\/www\.swapi\.tech\/api\/[a-z]+(\?page=\d&limit=\d{1,2})?/;
  I.assertMatchRegex(nextLink, linkRegex);
});
