import { Role } from '../generated/prisma/index.js';
import { userService } from '../services/index.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsyncWithAuth from '../utils/catchAsyncWithAuth.ts';
import pick from '../utils/pick.ts';
import httpStatus from 'http-status';

const createUser = catchAsyncWithAuth(async (req, res) => {
    const { email, password, name, role } = req.body;
    const user = await userService.createUser(email, password, name, role);
    res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsyncWithAuth(async (req, res) => {
    const filter = pick(req.validatedQuery, ['name', 'role']);
    const options = pick(req.validatedQuery, ['sortBy', 'limit', 'page']);
    const result = await userService.queryUsers(filter, options);
    res.send(result);
});

const getUser = catchAsyncWithAuth(async (req, res) => {
    const userId = parseInt(req.params.userId);

    // Check if user can access this resource (own profile or admin)
    if (req.user.role !== Role.ADMIN && req.user.id !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }

    const user = await userService.getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    res.send(user);
});

const updateUser = catchAsyncWithAuth(async (req, res) => {
    const userId = parseInt(req.params.userId);

    // Check if user can update this resource (own profile or admin)
    if (req.user.role !== Role.ADMIN && req.user.id !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }

    const user = await userService.updateUserById(userId, req.body);
    res.send(user);
});

const deleteUser = catchAsyncWithAuth(async (req, res) => {
    const userId = parseInt(req.params.userId);

    // Check if user can delete this resource (own profile or admin)
    if (req.user.role !== Role.ADMIN && req.user.id !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }

    await userService.deleteUserById(userId);
    res.status(httpStatus.NO_CONTENT).send();
});

export default {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
};
