import { Role } from '../generated/prisma/index.js';

const allRoles = {
    [Role.USER]: ['getApplications', 'manageApplications'],
    [Role.ADMIN]: ['getUsers', 'manageUsers', 'getApplications', 'manageApplications', 'getProducts', 'manageProducts']
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
