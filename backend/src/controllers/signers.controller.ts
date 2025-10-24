import { signersService } from '../services/index.ts';
import catchAsyncWithAuth from '../utils/catchAsyncWithAuth.ts';
import httpStatus from 'http-status';

const createSigner = catchAsyncWithAuth(async (req, res) => {
    const {
        applicationId,
        personalInfo,
        role,
        relationshipToBusiness,
        beneficialOwnershipPercentage,
        hasSigningAuthority
    } = req.body;

    const signer = await signersService.createAdditionalSigner(
        applicationId,
        {
            personalInfo,
            role,
            relationshipToBusiness,
            beneficialOwnershipPercentage,
            hasSigningAuthority
        },
        req.user.id
    );

    res.status(httpStatus.CREATED).send(signer);
});

const updateSigner = catchAsyncWithAuth(async (req, res) => {
    const { signerId } = req.params;

    const signer = await signersService.updateAdditionalSignerById(signerId, req.body, req.user.id);

    res.send(signer);
});

const getSigner = catchAsyncWithAuth(async (req, res) => {
    const { signerId } = req.params;

    const signer = await signersService.getAdditionalSignerById(signerId, req.user.id);

    res.send(signer);
});

const getSignersByApplication = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const signers = await signersService.getAdditionalSignersByApplicationId(applicationId, req.user.id);

    res.send(signers);
});

const deleteSigner = catchAsyncWithAuth(async (req, res) => {
    const { signerId } = req.params;

    await signersService.deleteAdditionalSignerById(signerId, req.user.id);

    res.status(httpStatus.NO_CONTENT).send();
});

export default {
    createSigner,
    updateSigner,
    getSigner,
    getSignersByApplication,
    deleteSigner
};
