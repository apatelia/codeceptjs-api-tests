import Joi from 'joi';

export const supportSchema = Joi.object({
  url: Joi.string().uri().required(),
  text: Joi.string().required()
});
