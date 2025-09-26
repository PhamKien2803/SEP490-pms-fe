import { useAppSelector } from '../redux/hooks';
const ADMIN_PERMISSIONS = [
    '/accounts',
    '/roles',
    '/students',
    '/parents',
];
// const TEACHER_PERMISSIONS = [
//     '/classes',
//     '/subjects',
//     '/exams',
//     '/scores',
// ];

// const STAFF_PERMISSIONS = [
//     '/classes',
//     '/subjects',
//     '/exams',
//     '/scores',
// ];

// const PARENT_PERMISSIONS = [
//     '/children',
//     '/scores',
// ]
export const usePermission = () => {
    const user = useAppSelector((state) => state.auth.user);

    const hasRole = (roleId: string) =>
        user?.roleList?.includes(roleId);

    const hasModule = (moduleName: string) =>
        user?.permissionListAll?.some(({ permissionList }) =>
            permissionList.some((mod) => mod.moduleId.moduleName === moduleName)
        );

    const hasFunction = (urlFunction: string) =>
        user?.permissionListAll?.some(({ permissionList }) =>
            permissionList.some((mod) =>
                mod.functionList.some((f) => f.functionId.urlFunction === urlFunction)
            )
        );

    const canAction = (urlFunction: string, actionName: string) =>
        user?.permissionListAll?.some(({ permissionList }) =>
            permissionList.some((mod) =>
                mod.functionList.some(
                    (f) =>
                        f.functionId.urlFunction === urlFunction &&
                        f.action.some((a) => a.name === actionName && a.allowed)
                )
            )
        );

    const getAllFunctionUrls = (): string[] => {
        if (!user?.permissionListAll) return [];

        const urls: string[] = [];

        for (const block of user.permissionListAll) {
            for (const module of block.permissionList) {
                for (const func of module.functionList) {
                    if (func.functionId?.urlFunction) {
                        urls.push(func.functionId.urlFunction);
                    }
                }
            }
        }

        return urls;
    };

    const isAdmin = (): boolean => {
        const userUrls = getAllFunctionUrls();
        return ADMIN_PERMISSIONS.every((adminUrl: string) => userUrls.includes(adminUrl));
    };

    return { hasRole, hasModule, hasFunction, canAction, isAdmin, getAllFunctionUrls };
};
