import { useMemo } from 'react';
import { usePermission } from './usePermission';
import { useCurrentUrlFunction } from '../context/PermissionContext';

export const usePagePermission = () => {
    const { canAction } = usePermission();
    const urlFunction = useCurrentUrlFunction();

    const permissions = useMemo(() => {
        if (!urlFunction) {
            return {
                canView: false,
                canCreate: false,
                canUpdate: false,
                canDelete: false,
            };
        }

        return {
            canView: canAction(urlFunction, 'view'),
            canCreate: canAction(urlFunction, 'create'),
            canUpdate: canAction(urlFunction, 'update'),
            canDelete: canAction(urlFunction, 'delete'),
        };
    }, [canAction, urlFunction]);

    return permissions;
};