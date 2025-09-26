// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConfigProvider, theme as antdTheme } from 'antd';
// import '../styles/antd-reset.css';
import { Header } from '@/components/pms/Header';
import { EnrollmentCTASection } from '@/components/pms/EnrollmentCTASection';
import ProgramsSection from '@/components/pms/ProgramCard';
import ProgramIntroSection from '@/components/pms/ProgramIntroSection';
import ProgramListSection from '@/components/pms/ProgramListSection';
import KnowMoreSection from '@/components/pms/KnowMoreSection';
import JoinSessionSection from '@/components/pms/JoinSessionSection';
import { FeaturesSection } from '@/components/pms/FeaturesSection';
import Footer from '@/components/pms/Footer';

const customTheme = {
    token: {
        colorPrimary: '#E5A3B3',
        colorSuccess: '#A0C4B8',
        colorWarning: '#FFDAB9',
        colorInfo: '#B2DFDB',
        colorError: '#FFCDD2',
        fontFamily: '"Nunito Sans", sans-serif',
    },
    components: {
        Button: {
            borderRadius: 50,
            fontWeight: 700,
            padding: 10,
        },
        Typography: {
            fontFamily: '"Lora", serif',
        },
    },
};

export default function PMSHome() {
    return (
        <ConfigProvider theme={customTheme}>
            <Header />
            <main>
                <EnrollmentCTASection />
                <ProgramsSection />
                <ProgramIntroSection />
                <ProgramListSection />
                <KnowMoreSection />
                <JoinSessionSection />
                <FeaturesSection />
            </main>
            <Footer />
        </ConfigProvider>
    );
}
