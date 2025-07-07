import Joi from 'joi';

export const userSchema = Joi.object({
  id: Joi.number().required(),
  email: Joi.string().email().required(),
  /* eslint-disable @typescript-eslint/naming-convention */
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  /* eslint-enable @typescript-eslint/naming-convention */
  avatar: Joi.string().uri().required()
});
