const allRoles = {
    USER: [],
    ADMIN: ['getUsers', 'manageUsers', 'manageApplications', 'getApplicationAudit']
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
