import Helper from '@codeceptjs/helper';
import { container } from 'codeceptjs';
import assert from 'node:assert';
import { z } from 'zod';

class ApiHelper extends Helper {
  /**
   * Asserts that the current JSON response matches the provided partial schema.
   *
   * @param {z.ZodObject} schema - The Zod schema to validate the response against.
   * @throws {z.ZodError} If the response does not conform to the schema.
   */
  seeResponseMatchesPartialJsonSchema (schema: z.ZodObject): void {
    const response = this.helpers.JSONResponse.response;

    // Make all properties in schema optional, before parsing.
    const partialSchema = schema.partial();
    const result = partialSchema.safeParse(response.data);

    if (!result.success) {
      throw new Error(z.prettifyError(result.error).replace('Error:[Wrapped Error] ', ''));
    }
  }

  /**
   * Asserts that the current JSON response matches the provided schema (Zod).
   *
   * @param {z.ZodObject} schema - The Zod schema to validate the response against.
   * @throws {z.ZodError} If the response does not conform to the schema.
   */
  seeResponseMatchesFullJsonSchema (schema: z.ZodObject): void {
    const response = this.helpers.JSONResponse.response;

    // Make all properties in schema required, before parsing.
    const fullSchema = schema.strict();
    const result = fullSchema.safeParse(response.data);

    if (!result.success) {
      throw new Error(z.prettifyError(result.error).replace('Error:[Wrapped Error] ', ''));
    }
  }

  /**
   * Asserts that the response's `Content-Type` header matches the expected content type.
   *
   * ```js
   * I.seeResponseContentTypeIs('application/json');
   * I.seeResponseContentTypeIs('application/xml');
   * ```
   * @param {string} contentType - The expected content type to compare against the response's `Content-Type` header.
   * @throws {AssertionError} Throws an assertion error if the response's `Content-Type` does not match the expected value.
   */
  seeResponseContentTypeIs (contentType: string): void {
    const response = this.helpers.JSONResponse.response;
    const contentTypeHeader = `${response.headers[ 'content-type' ]}`.toLowerCase();

    assert(contentTypeHeader.includes(contentType.toLowerCase()), `Expected response's content type to be '${contentType}', but got '${response.headers[ 'content-type' ]}'.`);
  }

  /**
   * Asserts that the response headers contain the specified key, and optionally checks if the header's value includes the provided string.
   *
   * ```js
   * I.seeResponseHeaderContainsKey('content-length');
   * I.seeResponseHeaderContainsKey('x-powered-by', 'Apigee');
   * ```
   * @param {string} key - The name of the response header to check for existence.
   * @param {string} value - (Optional) The value that the header should include. If provided, the assertion checks that the header's value contains this string.
   * @throws AssertionError if the header is not present, or if the value does not match when specified.
   */
  seeResponseHeaderContainsKey (key: string, value?: string): void {
    const response = this.helpers.JSONResponse.response;

    if (value) {
      assert(response.headers[ key ].includes(value), `Expected response header '${key}' to have value '${value}', but got '${response.headers[ key ]}'.`);
    } else {
      assert(response.headers[ key ], `Response does not contain header '${key}'.`);
    }
  }

  /**
   * Sends a GET request and measures the time taken for the request.
   * @param {string} url - The URL to send the GET request to.
   * @param {any} headers - Optional headers to include in the request.
   * @returns The response from the GET request.
   *
   * ```js
   * await I.sendTimedGetRequest(`/api/endpoint`, { 'Accept': 'application/json' });
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendTimedGetRequest (url: string, headers?: any): Promise<any> {
    const restHelper = container.helpers('REST');
    const start = performance.now();

    const response = await restHelper.sendGetRequest(url, headers);
    const duration = performance.now() - start;
    response.headers[ 'x-response-time' ] = duration.toFixed(2);

    return response;
  }

  /**
   * Retrieves the value of a specified field from the JSON response data.
   *
   * If the specified field does not exist in the response data, 'undefined' will be returned.
   *
   * @param {string} field - The name/json-path of the field to extract from the response data.
   * @returns {any} The value associated with the specified field in the response data, or `undefined` if the field does not exist.
   *
   * ```js
   * // Assuming the response data is structured like this:
   * {
   *   "companyName": "An Organization",
   *   "staff": [
   *     {
   *       "name": "John Doe",
   *       "age": 30,
   *       "city": "New York"
   *     },
   *     {
   *       "name": "Jane Smith",
   *       "age": 25,
   *       "city": "Los Angeles"
   *     }
   *   ],
   *   "contact": {
   *     "email": "contact@email.com",
   *     "phone": "1-800-000-000"
   *   }
   * }
   *
   * // To grab the 'companyName' field from the response data:
   * const name = await I.grabFieldFromResponse('companyName');
   *
   * // To grab the name of the first staff member:
   * const firstStaffName = await I.grabFieldFromResponse('staff.0.name');
   *
   * // To grab the email from the contact information:
   * const contactEmail = await I.grabFieldFromResponse('contact.email');
   *
   * // To grab the entire 'contact' object:
   * const contactInfo = await I.grabFieldFromResponse('contact');
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async grabFieldFromResponse (field: string): Promise<any> {
    const response = this.helpers.JSONResponse.response;

    let value = response.data;
    const keys = field.split('.');

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[ key ];
      } else {
        return undefined; // Field does not exist
      }
    }

    return value;
  }

  /**
   * Retrieves the response time from the headers.
   * @returns {number} The response time in milliseconds.
   *
   * ```js
   * // Example usage:
   * const responseTime = await I.grabResponseTime();
   * ```
   */
  async grabResponseTime (): Promise<number> {
    const response = this.helpers.JSONResponse.response;
    const responseTime = Number(response.headers[ 'x-response-time' ]);

    return responseTime;
  }
}

export = ApiHelper;
