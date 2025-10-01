const LocalStorageKey = {
    USER_TOKEN: 'userToken',
    IS_SIDE_BAR_COLLAPSED: 'isSideBarCollapsed',
    EMAIL: 'email',
    TOKEN: 'token'
} as const;

type LocalStorageKey = typeof LocalStorageKey[keyof typeof LocalStorageKey];

export { LocalStorageKey };
