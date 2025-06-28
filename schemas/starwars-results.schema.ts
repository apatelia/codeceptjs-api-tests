import Joi from 'joi';

const starWarsResultItemSchema = Joi.object({
  uid: Joi.string().required(),
  name: Joi.string().required(),
  url: Joi.string().uri().required()
});

const socialSchema = Joi.object({
  discord: Joi.string().uri(),
  reddit: Joi.string().uri(),
  github: Joi.string().uri(),
});

export const schema = Joi.object({
  message: Joi.string().required(),
  total_records: Joi.number().required(),
  total_pages: Joi.number().required(),
  previous: Joi.string().allow(null),
  next: Joi.string().allow(null),
  results: Joi.array().items(starWarsResultItemSchema).required(),
  social: socialSchema.required(),
  apiVersion: Joi.string(),
  timestamp: Joi.date().iso(),
  support: Joi.object()
});
