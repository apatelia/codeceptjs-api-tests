import Helper from '@codeceptjs/helper';
import Joi from 'joi';

class JsonExtendedHelper extends Helper {

  /**
   * Asserts that the current JSON response matches the provided partial {@link https://joi.dev/} schema.
   * Unknown/additional properties in the response are stripped before validation.
   *
   *
   * ```js
   * * // This schema defines only the required fields.
   * const requiredFieldsSchema = joi.object({
   *   name: joi.string().required(),
   *   age: joi.number().required()
   * });
   *
   * * // Assume that response is { name: 'jon', age: 30, city: 'New York' }
   * * // Below assertion will pass, even if the response contains additional 'city' property.
   * I.seeResponseMatchesPartialJsonSchema(requiredFieldsSchema);
   *
   * ```
   *
   * @param {Joi.ObjectSchema} schema - The Joi object schema to validate the response against.
   * @throws {ValidationError} If the response does not conform to the schema.
   */
  seeResponseMatchesPartialJsonSchema (schema: Joi.ObjectSchema): void {
    const response = this.helpers.JSONResponse.response;
    Joi.assert(response.data, schema, { stripUnknown: true });
  }

  /**
   * Retrieves the value of a specified field from the JSON response data.
   *
   * ```js
   * * // Assuming the response data is structured like this:
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
   * * // To grab the 'companyName' field from the response data:
   * const name = await I.grabFieldFromResponse('companyName');
   *
   * * // To grab the name of the first staff member:
   * const firstStaffName = await I.grabFieldFromResponse('staff.0.name');
   *
   * * // To grab the email from the contact information:
   * const contactEmail = await I.grabFieldFromResponse('contact.email');
   *
   * * // To grab the entire 'contact' object:
   * const contactInfo = await I.grabFieldFromResponse('contact');
   * ```
   *
   * If the specified field does not exist in the response data, 'undefined' will be returned.
   *
   * @param field - The name/json-path of the field to extract from the response data.
   * @returns The value associated with the specified field in the response data, or `undefined` if the field does not exist.
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
}

export = JsonExtendedHelper;
