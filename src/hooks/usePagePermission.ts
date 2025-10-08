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
                canApprove: false,
                canExportfile: false,
                canImportfile: false,
                canReject: false
            };
        }

        return {
            canView: canAction(urlFunction, 'view'),
            canCreate: canAction(urlFunction, 'create'),
            canUpdate: canAction(urlFunction, 'update'),
            canDelete: canAction(urlFunction, 'delete'),
            canApprove: canAction(urlFunction, 'approve'),
            canExportfile: canAction(urlFunction, 'export'),
            canImportfile: canAction(urlFunction, 'import'),
            canReject: canAction(urlFunction, 'reject')
        };
    }, [canAction, urlFunction]);

    return permissions;
};