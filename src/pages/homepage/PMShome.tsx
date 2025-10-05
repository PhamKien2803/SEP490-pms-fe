import { ConfigProvider } from 'antd';
import { EnrollmentCTASection } from '../../components/pms/EnrollmentCTASection';
import ProgramsSection from '../../components/pms/ProgramCard';
import ProgramIntroSection from '../../components/pms/ProgramIntroSection';
import ProgramListSection from '../../components/pms/ProgramListSection';
import KnowMoreSection from '../../components/pms/KnowMoreSection';
import JoinSessionSection from '../../components/pms/JoinSessionSection';
import { FeaturesSection } from '../../components/pms/FeaturesSection';
import Footer from '../../components/pms/Footer';
import { Header } from './../../components/pms/Header';

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
            fontFamily: '"Poppins", sans-serif',
        },
    },
};

export default function PMSHome() {
    return (
        <div style={{ overflowX: 'hidden' }}>
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
        </div>
    );
}