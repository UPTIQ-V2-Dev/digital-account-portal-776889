import Joi from 'joi';

const initiateKYCVerification = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const getKYCVerification = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

export default {
    initiateKYCVerification,
    getKYCVerification
};