Feature('Content Type Validation').tag('@contentType');

Scenario('Check Response Content-Type', async ({ I }) => {
  await I.sendGetRequest('https://mocktarget.apigee.net/xml');
  I.seeResponseCodeIs(200);

  // * Check if the response content type is XML or not.
  I.seeResponseContentTypeIs('application/xml');

  // * Check if the response header contains the 'etag' key.
  I.seeResponseHeaderContainsKey('etag');

  // * Check if the response header contains the 'x-powered-by' key with value 'Apigee'.
  I.seeResponseHeaderContainsKey('x-powered-by', 'Apigee');
}).tag('@responseContentType');

Scenario('Check for Response Time', async ({ I }) => {
  // Send a timed GET request to measure response time.
  await I.sendTimedGetRequest('https://mocktarget.apigee.net/xml');

  // To use grabResponseTime(),
  // you must first use a timed request method like sendTimedGetRequest() to make API request.
  const responseTime = await I.grabResponseTime();
  I.say(`Response time: ${responseTime} ms`);

  I.expectBelow(responseTime, 500, 'Response time is above 500 ms');
}).tag('@responseTime');
