import React from "react";
import {
  Modal,
  Typography,
  Divider,
  Descriptions,
  Tag,
  Row,
  Col,
  Button,
  Space,
} from "antd";
import {
  EyeOutlined,
  CloseCircleOutlined,
  UserOutlined,
  TeamOutlined,
  ContainerOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { IGuardianRecord } from "../../../types/guardians";

const { Title, Text } = Typography;
const ACCENT_COLOR = "#1890ff";
const TEXT_DARK_COLOR = "#262626";

interface DetailGuardianProps {
  open: boolean;
  onClose: () => void;
  guardianRecord: IGuardianRecord;
}

const renderValue = (value: React.ReactNode) => (
  <Text style={{ fontWeight: 500, color: TEXT_DARK_COLOR }}>{value}</Text>
);

const DetailGuardian: React.FC<DetailGuardianProps> = ({
  open,
  onClose,
  guardianRecord,
}) => {
  return (
    <Modal
      title={
        <Title
          level={4}
          style={{
            margin: 0,
            color: TEXT_DARK_COLOR,
            display: "flex",
            alignItems: "center",
          }}
        >
          <EyeOutlined
            style={{ marginRight: 10, fontSize: 24, color: ACCENT_COLOR }}
          />{" "}
          Chi Tiết Người Đưa Đón
        </Title>
      }
      open={open}
      onCancel={onClose}
      footer={
        <Row justify="end" style={{ padding: "10px 0" }}>
          <Button
            key="close"
            onClick={onClose}
            type="primary"
            style={{
              backgroundColor: ACCENT_COLOR,
              borderColor: ACCENT_COLOR,
              borderRadius: 6,
              height: 40,
            }}
          >
            Đóng
          </Button>
        </Row>
      }
      width={600}
      closeIcon={
        <CloseCircleOutlined style={{ color: ACCENT_COLOR, fontSize: 18 }} />
      }
      bodyStyle={{ padding: "0 24px 24px 24px" }}
    >
      <Divider style={{ margin: "10px 0 24px 0" }} />

      <Row
        justify="space-between"
        align="middle"
        style={{
          marginBottom: 20,
          padding: "15px 20px",
          backgroundColor: "#fafafa",
          borderRadius: 8,
        }}
      >
        <Col>
          <Space direction="vertical" size={2}>
            <Text
              type="secondary"
              style={{ fontSize: 13, textTransform: "uppercase" }}
            >
              Họ và Tên Người Đón
            </Text>
            <Title level={3} style={{ margin: 0, color: ACCENT_COLOR }}>
              {guardianRecord.fullName}
            </Title>
          </Space>
        </Col>
      </Row>

      <Title
        level={5}
        style={{
          marginTop: 0,
          color: TEXT_DARK_COLOR,
          display: "flex",
          alignItems: "center",
        }}
      >
        <UserOutlined style={{ marginRight: 8, color: ACCENT_COLOR }} /> Chi
        tiết cá nhân
      </Title>
      <Descriptions
        column={{ xs: 1, sm: 2, md: 2 }}
        layout="vertical"
        size="small"
        style={{ marginBottom: 20 }}
      >
        <Descriptions.Item label="Số điện thoại">
          {renderValue(<Text copyable>{guardianRecord.phoneNumber}</Text>)}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">
          {renderValue(
            guardianRecord.dob ? (
              dayjs(guardianRecord.dob).format("DD/MM/YYYY")
            ) : (
              <Tag color="default">Chưa cung cấp</Tag>
            )
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Mối quan hệ">
          {renderValue(
            <Space>
              <Tag color="blue" style={{ borderRadius: 4, fontWeight: 500 }}>
                {guardianRecord.relationship}
              </Tag>
              {guardianRecord.relationshipDetail && (
                <Text type="secondary" italic style={{ fontSize: 12 }}>
                  ({guardianRecord.relationshipDetail})
                </Text>
              )}
            </Space>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu ủy quyền">
          {renderValue(
            guardianRecord.pickUpDate ? (
              <Tag
                color="processing"
                style={{ borderRadius: 4, fontWeight: 500 }}
              >
                {dayjs(guardianRecord.pickUpDate).format("DD/MM/YYYY")}
              </Tag>
            ) : (
              <Tag color="warning">Chưa ủy quyền</Tag>
            )
          )}
        </Descriptions.Item>
      </Descriptions>

      <Divider dashed style={{ margin: "10px 0 20px 0" }} />

      <Title
        level={5}
        style={{
          marginTop: 0,
          color: TEXT_DARK_COLOR,
          display: "flex",
          alignItems: "center",
        }}
      >
        <TeamOutlined style={{ marginRight: 8, color: ACCENT_COLOR }} /> Liên
        kết & Ghi chú
      </Title>
      <Descriptions column={1} layout="vertical" size="small">
        {/* <Descriptions.Item label="Học sinh liên quan">
          {renderValue(
            typeof guardianRecord.studentId !== "string" ? (
              <Text strong>{guardianRecord.studentId.fullName}</Text>
            ) : (
              <Text type="secondary">N/A</Text>
            )
          )}
        </Descriptions.Item> */}
        <Descriptions.Item label="Phụ huynh (Chủ quản)">
          {renderValue(
            typeof guardianRecord.parentId !== "string" &&
              guardianRecord.parentId ? (
              <Text>
                {guardianRecord.parentId.fullName} |{" "}
                {guardianRecord.parentId.phoneNumber}
              </Text>
            ) : (
              <Text type="secondary">N/A</Text>
            )
          )}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <ContainerOutlined style={{ color: ACCENT_COLOR }} /> Ghi chú
            </Space>
          }
        >
          {renderValue(
            guardianRecord.note ? (
              <Text style={{ lineHeight: 1.5, display: "block" }}>
                {guardianRecord.note}
              </Text>
            ) : (
              <Text type="secondary" italic>
                Không có ghi chú
              </Text>
            )
          )}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default DetailGuardian;
