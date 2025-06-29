Feature('Booking').tag('@booking');

import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

const host = 'https://restful-booker.herokuapp.com';
const authCredentials = {
  username: `${process.env.AUTH_USER}`,
  password: `${process.env.AUTH_PASSWORD}`
};


let token: string;
let bookingId: number;

BeforeSuite(async ({ I }) => {
  const response = await I.sendPostRequest(`${host}/auth`,
    authCredentials,
    { 'Content-Type': 'application/json' }
  );

  I.seeResponseCodeIsSuccessful();

  token = response.data.token;
  I.say(`Token: ${token}`);
});

Scenario('Create a new booking', async ({ I }) => {
  const bookingData = {
    'firstname': 'Jim',
    'lastname': 'Brown',
    'totalprice': 111,
    'depositpaid': true,
    'bookingdates': {
      'checkin': '2025-09-01',
      'checkout': '2025-09-10'
    },
    'additionalneeds': 'Breakfast'
  };

  const response = await I.sendPostRequest(`${host}/booking`,
    bookingData,
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  );

  I.seeResponseCodeIs(200);

  I.seeResponseContainsKeys([ 'bookingid' ]);
  bookingId = response.data.bookingid;
  I.say(`Booking ID: ${bookingId}`);
});

Scenario('Get booking details', async ({ I }) => {
  const response = await I.sendGetRequest(`${host}/booking/${bookingId}`,
    { 'Accept': 'application/json' }
  );

  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({
    firstname: 'Jim',
    lastname: 'Brown',
    totalprice: 111
  });

  const bookingDates = response.data.bookingdates;
  I.assertMatchRegex(bookingDates.checkin, /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);
  I.assertMatchRegex(bookingDates.checkout, /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);
});

Scenario('Delete booking', async ({ I }) => {
  await I.sendDeleteRequest(`${host}/booking/${bookingId}`,
    {
      'Accept': 'application/json',
      'Cookie': `token=${token}`,
    }
  );

  I.seeResponseCodeIs(201);
  I.say('Booking deleted successfully');
});
