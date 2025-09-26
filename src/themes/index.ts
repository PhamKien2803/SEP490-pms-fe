import { ThemeConfig } from 'antd';
import { colors } from './color';


const theme: ThemeConfig = {
    // cssVar: { key: 'root-obr' },
    // hashed: false,
    token: {
        colorPrimary: colors.primary,
        colorPrimaryHover: colors.primaryHover,
        colorPrimaryActive: colors.primaryActive,
        colorBgContainerDisabled: colors.ghost,
        fontFamily: 'inherit',
    }
};

export default theme;
