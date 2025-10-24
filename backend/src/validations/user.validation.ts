import { Role } from '../generated/prisma/index.js';
import { password } from './custom.validation.ts';
import Joi from 'joi';

const createUser = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required().custom(password),
        role: Joi.string()
            .required()
            .valid(...Object.values(Role))
    })
};

const getUsers = {
    query: Joi.object().keys({
        name: Joi.string(),
        role: Joi.string().valid(...Object.values(Role)),
        sortBy: Joi.string(),
        limit: Joi.number().integer().min(1).default(10),
        page: Joi.number().integer().min(1).default(1)
    })
};

const getUser = {
    params: Joi.object().keys({
        userId: Joi.number().integer().required()
    })
};

const updateUser = {
    params: Joi.object().keys({
        userId: Joi.number().integer().required()
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            email: Joi.string().email(),
            password: Joi.string().custom(password)
        })
        .min(1)
};

const deleteUser = {
    params: Joi.object().keys({
        userId: Joi.number().integer().required()
    })
};

export default {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
};
