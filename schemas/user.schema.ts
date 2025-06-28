import Joi from 'joi';

export const userSchema = Joi.object({
  id: Joi.number().required(),
  email: Joi.string().email().required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  avatar: Joi.string().uri().required()
});
