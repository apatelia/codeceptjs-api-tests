Feature('users').tag('@users');

import { faker } from '@faker-js/faker';
import Joi from 'joi';
import { supportSchema } from '../schemas/support.schema';
import { userSchema } from '../schemas/user.schema';

const users = new DataTable([ 'name', 'job' ]);
const userIdList = new DataTable([ 'id' ]);

generateUserData();

Scenario('List Users', async ({ I }) => {
  await I.sendGetRequest('/api/users?page=2');
  I.seeResponseCodeIs(200);

  const schema = Joi.object({
    page: Joi.number().required(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    per_page: Joi.number().required(),
    total: Joi.number().required(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    total_pages: Joi.number().required(),
    data: Joi.array().items(userSchema).required(),
    support: supportSchema.required()
  });

  I.seeResponseMatchesJsonSchema(schema);
});

Data(users).Scenario('Create New User', async ({ I, current }) => {
  const response = await I.sendPostRequest('/api/users', current);
  I.seeResponseCodeIsSuccessful();
  I.seeResponseCodeIs(201);
  I.say(`User created with ID: ${response.data.id}`);
  userIdList.add([ response.data.id ]);
});

Data(userIdList).Scenario('Get User by ID', async ({ I, current }) => {
  await I.sendGetRequest(`/api/users/${current.id}`);
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({
    data: {
      id: current.id
    }
  });

  const schema = Joi.object({
    data: userSchema.required(),
    support: supportSchema.required()
  });

  I.seeResponseMatchesJsonSchema(schema);
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
