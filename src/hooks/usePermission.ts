// import { useAppSelector } from '../redux/hooks';

// export const usePermission = () => {
//     const user = useAppSelector((state) => state.auth.user);

//     const hasRole = (roleId: string) =>
//         user?.roleList?.includes(roleId);

//     const hasModule = (moduleName: string) =>
//         user?.permissionListAll?.some(({ permissionList }) =>
//             permissionList.some((mod) => mod.moduleId.moduleName === moduleName)
//         );

//     const hasFunction = (urlFunction: string) =>
//         user?.permissionListAll?.some(({ permissionList }) =>
//             permissionList.some((mod) =>
//                 mod.functionList.some((f) => f.functionId.urlFunction === urlFunction)
//             )
//         );

//     const canAction = (urlFunction: string, actionName: string) =>
//         user?.permissionListAll?.some(({ permissionList }) =>
//             permissionList.some((mod) =>
//                 mod.functionList.some(
//                     (f) =>
//                         f.functionId.urlFunction === urlFunction &&
//                         f.action.some((a) => a.name === actionName && a.allowed)
//                 )
//             )
//         );

//     const getAllFunctionUrls = (): string[] => {
//         if (!user?.permissionListAll) return [];

//         const urls: string[] = [];

//         for (const block of user.permissionListAll) {
//             for (const module of block.permissionList) {
//                 for (const func of module.functionList) {
//                     if (func.functionId?.urlFunction) {
//                         urls.push(func.functionId.urlFunction);
//                     }
//                 }
//             }
//         }

//         return urls;
//     };

//     const getAllowedActions = (urlFunction: string): string[] => {
//         if (!user?.permissionListAll) return [];
//         for (const block of user.permissionListAll) {
//             for (const module of block.permissionList) {
//                 const func = module.functionList.find(f => f.functionId.urlFunction === urlFunction);
//                 if (func) {
//                     return func.action
//                         .filter(act => act.allowed)
//                         .map(act => act.name);
//                 }
//             }
//         }
//         return [];
//     };

//     return { hasRole, hasModule, hasFunction, canAction, getAllFunctionUrls, getAllowedActions };
// };


import { useAppSelector } from '../redux/hooks';

export const usePermission = () => {
    const permissions = useAppSelector((state) => state.auth.permissionsMap);
    const userRoles = useAppSelector((state) => state.auth.user?.roleList);

    const canAction = (urlFunction: string, actionName: string): boolean => {
        return permissions[urlFunction]?.[actionName] ?? false;
    };

    const hasRole = (roleId: string): boolean => {
        return userRoles?.includes(roleId) ?? false;
    };

    const hasFunction = (urlFunction: string): boolean => {
        const actions = permissions[urlFunction];
        if (!actions) return false;
        return Object.values(actions).some(allowed => allowed === true);
    };

    const getAllowedActions = (urlFunction: string): string[] => {
        const actions = permissions[urlFunction];
        if (!actions) return [];

        return Object.entries(actions)
            .filter(([_, isAllowed]) => isAllowed)
            .map(([actionName]) => actionName);
    };

    return {
        canAction,
        hasRole,
        hasFunction,
        getAllowedActions,
    };
};