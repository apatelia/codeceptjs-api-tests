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
