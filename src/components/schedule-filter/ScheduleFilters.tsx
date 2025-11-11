import React from "react";
import { Row, Col, Select, Typography, Card, Form } from "antd";
import {
    UserOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    FilterOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

interface Student {
    _id: string;
    fullName: string;
}

interface SchoolYear {
    _id: string;
    schoolYear: string;
}

interface Props {
    listChild: Student[];
    selectedStudentId?: string;
    setSelectedStudentId: (id: string) => void;
    schoolYears: SchoolYear[];
    selectedSchoolYear?: string;
    setSelectedSchoolYear: (id: string) => void;
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
    monthOptions: { value: string; label: string }[];
    isInitialLoading: boolean;
    isClassLoading: boolean;
    isScheduleLoading: boolean;
    classData?: any;
}

const ScheduleFilters: React.FC<Props> = ({
    listChild,
    selectedStudentId,
    setSelectedStudentId,
    schoolYears,
    selectedSchoolYear,
    setSelectedSchoolYear,
    selectedMonth,
    setSelectedMonth,
    monthOptions,
    isInitialLoading,
    isClassLoading,
    isScheduleLoading,
    classData,
}) => {
    return (
        <Card
            bordered
            title={
                <Text strong>
                    <FilterOutlined style={{ marginRight: 8 }} />
                    Lọc Thông Tin
                </Text>
            }
            style={{
                marginBottom: 24,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
        >
            <Form layout="vertical">
                <Row gutter={[24, 0]}>
                    <Col xs={24} md={8}>
                        <Form.Item
                            label={
                                <Text strong>
                                    <UserOutlined style={{ marginRight: 4 }} />
                                    Chọn con
                                </Text>
                            }
                        >
                            <Select
                                value={selectedStudentId}
                                style={{ width: "100%" }}
                                onChange={setSelectedStudentId}
                                placeholder="Chọn con của bạn"
                                size="large"
                                loading={isInitialLoading}
                                disabled={isInitialLoading}
                            >
                                {listChild.map((student) => (
                                    <Option key={student._id} value={student._id}>
                                        {student.fullName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            label={
                                <Text strong>
                                    <CalendarOutlined style={{ marginRight: 4 }} />
                                    Chọn năm học
                                </Text>
                            }
                        >
                            <Select
                                value={selectedSchoolYear}
                                style={{ width: "100%" }}
                                onChange={setSelectedSchoolYear}
                                placeholder="Chọn năm học"
                                size="large"
                                loading={isClassLoading}
                                disabled={!selectedStudentId || isClassLoading}
                            >
                                {schoolYears.map((year) => (
                                    <Option key={year._id} value={year.schoolYear}>
                                        {year.schoolYear}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            label={
                                <Text strong>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    Chọn tháng
                                </Text>
                            }
                        >
                            <Select
                                value={selectedMonth}
                                style={{ width: "100%" }}
                                onChange={setSelectedMonth}
                                placeholder="Chọn tháng"
                                size="large"
                                loading={isScheduleLoading}
                                disabled={!classData || isScheduleLoading}
                            >
                                {monthOptions.map((month) => (
                                    <Option key={month.value} value={month.value}>
                                        {month.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default ScheduleFilters;