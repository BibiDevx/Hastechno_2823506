import Joi from '@hapi/joi';

export default {
  newUser: Joi.object({
  user_name: Joi.string().email().required().min(10),
  user_password: Joi.string().required().min(7),
  status: Joi.number().required(),
  role: Joi.number().required(),
}),

  updateUser: Joi.object({
  user_name: Joi.string().email().required().min(10),
  user_password: Joi.string().required().min(7),
  status: Joi.number().required(),
  role: Joi.number().required(),
}),

};
