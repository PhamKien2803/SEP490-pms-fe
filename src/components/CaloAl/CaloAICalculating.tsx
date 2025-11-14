import React, { useState, useEffect } from "react";
import { Flex, Typography, theme } from "antd";
import { BulbOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { useToken } = theme;


const DynamicLoadingText = () => {
    const [dots, setDots] = useState("");
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 400);
        return () => clearInterval(interval);
    }, []);

    return (
        <Text type="secondary" style={{ fontSize: 16, minHeight: 24 }}>
            Hệ thống đang phân tích{dots} Vui lòng đợi.
        </Text>
    );
};


const CaloAICalculating = () => {
    const { token } = useToken();
    const keyframes = `
    @keyframes pulse {
      0% {
        transform: scale(0.9);
        opacity: 0.8;
      }
      100% {
        transform: scale(2.5);
        opacity: 0;
      }
    }
  `;

    const animationWrapperStyle: React.CSSProperties = {
        position: "relative",
        width: 150,
        height: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
    };

    const pulseRingStyle: React.CSSProperties = {
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        border: `3px solid ${token.colorPrimary}`,
        animation: "pulse 2.5s infinite cubic-bezier(0.66, 0, 0, 1)",
        boxShadow: `0 0 15px ${token.colorPrimary}`,
    };

    const coreIconStyle: React.CSSProperties = {
        width: 80,
        height: 80,
        borderRadius: "50%",
        backgroundColor: token.colorPrimaryBg,
        color: token.colorPrimary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 40,
        zIndex: 1,
        boxShadow: `0 0 25px ${token.colorPrimaryBgHover}`,
    };

    return (
        <>
            <style>{keyframes}</style>

            <Flex
                vertical
                align="center"
                justify="center"
                style={{
                    minHeight: "calc(100vh - 150px)",
                    gap: 16,
                    padding: 24,
                    background: `radial-gradient(circle, ${token.colorBgLayout} 0%, ${token.colorBgContainer} 100%)`
                }}
            >
                <div style={animationWrapperStyle}>
                    <div style={pulseRingStyle} />
                    <div style={{ ...pulseRingStyle, animationDelay: "0.8s" }} />
                    <div style={coreIconStyle}>
                        <BulbOutlined />
                    </div>
                </div>

                <div style={{ textAlign: "center", maxWidth: 480 }}>
                    <Title level={3} style={{ marginBottom: 12 }}>
                        AI đang tính toán...
                    </Title>
                    <DynamicLoadingText />
                </div>
            </Flex>
        </>
    );
};

export default CaloAICalculating;