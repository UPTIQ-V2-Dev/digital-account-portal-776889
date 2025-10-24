import prisma from '../client.ts';
import { Prisma, Role, User } from '../generated/prisma/index.js';
import ApiError from '../utils/ApiError.ts';
import { encryptPassword } from '../utils/encryption.ts';
import httpStatus from 'http-status';

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (
    email: string,
    password: string,
    name: string,
    role: Role = Role.USER
): Promise<Pick<User, 'id' | 'email' | 'name' | 'role' | 'isEmailVerified' | 'createdAt' | 'updatedAt'>> => {
    if (await getUserByEmail(email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid input or duplicate email');
    }
    return prisma.user.create({
        data: {
            email,
            name,
            password: await encryptPassword(password),
            role
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

/**
 * Query for users with pagination
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (
    filter: any,
    options: {
        limit?: number;
        page?: number;
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    }
): Promise<{
    results: Array<Pick<User, 'id' | 'email' | 'name' | 'role' | 'isEmailVerified' | 'createdAt' | 'updatedAt'>>;
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}> => {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const sortBy = options.sortBy;
    const sortType = options.sortType ?? 'desc';

    // Build filter for name (case insensitive)
    const whereClause: any = {};
    if (filter.name) {
        whereClause.name = {
            contains: filter.name,
            mode: 'insensitive'
        };
    }
    if (filter.role) {
        whereClause.role = filter.role;
    }

    // Get total count for pagination
    const totalResults = await prisma.user.count({ where: whereClause });
    const totalPages = Math.ceil(totalResults / limit);

    // Get users
    const users = await prisma.user.findMany({
        where: whereClause,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortType } : { createdAt: 'desc' }
    });

    return {
        results: users,
        page,
        limit,
        totalPages,
        totalResults
    };
};

/**
 * Get user by id
 * @param {number} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getUserById = async <Key extends keyof User>(
    id: number,
    keys: Key[] = ['id', 'email', 'name', 'role', 'isEmailVerified', 'createdAt', 'updatedAt'] as Key[]
): Promise<Pick<User, Key> | null> => {
    return (await prisma.user.findUnique({
        where: { id },
        select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
    })) as Promise<Pick<User, Key> | null>;
};

/**
 * Get user by email
 * @param {string} email
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getUserByEmail = async <Key extends keyof User>(
    email: string,
    keys: Key[] = ['id', 'email', 'name', 'role', 'isEmailVerified', 'createdAt', 'updatedAt'] as Key[]
): Promise<Pick<User, Key> | null> => {
    return await (prisma.user.findUnique({
        where: { email },
        select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
    }) as Promise<Pick<User, Key> | null>);
};

/**
 * Update user by id
 * @param {number} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async <Key extends keyof User>(
    userId: number,
    updateBody: Prisma.UserUpdateInput,
    keys: Key[] = ['id', 'email', 'name', 'role', 'isEmailVerified', 'createdAt', 'updatedAt'] as Key[]
): Promise<Pick<User, Key> | null> => {
    const user = await getUserById(userId, ['id', 'email', 'name']);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (updateBody.email && updateBody.email !== user.email) {
        const existingUser = await getUserByEmail(updateBody.email as string);
        if (existingUser) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid input or duplicate email');
        }
    }

    // Encrypt password if provided
    const updateData = { ...updateBody };
    if (updateData.password) {
        updateData.password = await encryptPassword(updateData.password as string);
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
    });
    return updatedUser as Pick<User, Key> | null;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId: number): Promise<User> => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    await prisma.user.delete({ where: { id: user.id } });
    return user;
};

export default {
    createUser,
    queryUsers,
    getUserById,
    getUserByEmail,
    updateUserById,
    deleteUserById
};
