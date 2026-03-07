Feature('Users API').tag('@users');

import { faker } from '@faker-js/faker';
import * as z from 'zod';
import { metaSchema } from '../schemas/meta.schema';
import { supportSchema } from '../schemas/support.schema';
import { userSchema } from '../schemas/user.schema';

const users = new DataTable([ 'name', 'job' ]);
const userIdList = new DataTable([ 'id' ]);
const apiKey = {
  'x-api-key': 'reqres-free-v1'
};

generateUserData();

Scenario('List Users', async ({ I }) => {
  await I.sendGetRequest('/api/users?page=2', apiKey);
  I.seeResponseCodeIs(200);

  const userListSchema = z.object({
    page: z.number(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    per_page: z.number(),
    total: z.number(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    total_pages: z.number(),
    data: z.array(userSchema),
    support: supportSchema,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _meta: metaSchema.optional()
  });

  I.seeResponseMatchesFullJsonSchema(userListSchema);
});

Data(users).Scenario('Create New User', async ({ I, current }) => {
  const response = await I.sendPostRequest('/api/users', apiKey, current);
  I.seeResponseCodeIsSuccessful();
  I.seeResponseCodeIs(201);
  I.say(`User created with ID: ${response.data.id}`);
  userIdList.add([ response.data.id ]);
});

Data(userIdList).Scenario('Get User by ID', async ({ I, current }) => {
  await I.sendGetRequest(`/api/users/${current.id}`, apiKey);
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({
    data: {
      id: current.id
    }
  });

  const singleUserSchema = z.object({
    data: userSchema,
    support: supportSchema,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _meta: metaSchema.optional()
  });

  I.seeResponseMatchesFullJsonSchema(singleUserSchema);
});

function generateUserData (): void {
  const userIds = [ 1, 2, 3 ];

  userIds.forEach(id => userIdList.add([ id * 2 ]));

  for (let index = 0; index < 2; index++) {
    const userData = {
      name: faker.person.fullName(),
      job: faker.person.jobTitle()
    };

    users.add([ userData.name, userData.job ]);
  }
}
