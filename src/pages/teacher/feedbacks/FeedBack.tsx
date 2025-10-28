import { useEffect, useState } from 'react';
import {
    Card,
    Table,
    DatePicker,
    Row,
    Col,
    Button,
    Empty,
    Spin,
    Select,
    Tag,
    Space,
    Tooltip,
} from 'antd';
import {
    EyeOutlined,
    EditOutlined,
    FormOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { IFeedbackListItem, IClassInfo } from '../../../types/teacher';
import { teacherApis, schoolYearApis } from '../../../services/apiServices';
import FeedbackDetailModal from '../../../modal/feedback-modal/FeedbackDetailModal';
import { useNavigate } from 'react-router-dom';
import { constants } from '../../../constants';
import { usePagePermission } from '../../../hooks/usePagePermission';
const { Option } = Select;

function FeedBack() {
    const user = useCurrentUser();
    const navigate = useNavigate();
    const teacherId = user?.staff;
    const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
    const [feedbacks, setFeedbacks] = useState<IFeedbackListItem[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<IFeedbackListItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLoadingTeacherData, setIsLoadingTeacherData] = useState(false);
    const { canUpdate, canCreate } = usePagePermission();
    const [_, setSchoolYears] = useState<{ _id: string; schoolYear: string }[]>([]);
    const [__, setSelectedSchoolYearId] = useState<string | null>(null);
    const [teacherData, setTeacherData] = useState<any>(null);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            if (!teacherId) return;
            setIsLoadingTeacherData(true);

            try {
                const res = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
                const sorted = res.data.sort(
                    (a, b) =>
                        parseInt(b.schoolYear.split('-')[0]) -
                        parseInt(a.schoolYear.split('-')[0])
                );
                const latestYear = sorted[0]?._id;
                setSchoolYears(sorted);
                setSelectedSchoolYearId(latestYear);

                if (latestYear) {
                    const data = await teacherApis.getClassAndStudentByTeacher(
                        teacherId,
                        latestYear
                    );
                    setTeacherData(data);
                    if (data.classes?.length > 0) {
                        setSelectedClassId(data.classes[0]._id);
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error('Không thể tải thông tin lớp hoặc năm học.');
            } finally {
                setIsLoadingTeacherData(false);
            }
        };
        init();
    }, [teacherId]);

    const fetchFeedbacks = async () => {
        if (!selectedClassId) return;
        try {
            setLoading(true);
            const data = await teacherApis.getFeedbackByClassAndDate(selectedClassId, date);
            setFeedbacks(data);
        } catch (error) {
            toast.error('Không thể tải dữ liệu phản hồi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [selectedClassId, date]);

    const columns = [
        {
            title: 'Học sinh',
            dataIndex: 'studentId',
            key: 'fullName',
            fixed: 'left' as 'left',
            width: 180,
            render: (student: IFeedbackListItem['studentId']) => student?.fullName,
        },
        {
            title: 'Giới tính',
            dataIndex: 'studentId',
            key: 'gender',
            width: 100,
            render: (student: IFeedbackListItem['studentId']) => (
                <Tag color={student?.gender === 'Nam' ? 'blue' : 'pink'}>
                    {student?.gender}
                </Tag>
            ),
        },
        {
            title: 'Tuổi (Ngày sinh)',
            dataIndex: 'studentId',
            key: 'dob',
            width: 150,
            render: (student: IFeedbackListItem['studentId']) => {
                const dob = student?.dob;
                if (!dob) return 'N/A';
                const age = dayjs().diff(dayjs(dob), 'year');
                const formattedDob = dayjs(dob).format('DD/MM/YYYY');
                return `${age} tuổi (${formattedDob})`;
            },
        },
        {
            title: 'Lớp',
            dataIndex: 'classId',
            key: 'className',
            width: 120,
            render: (classObj: IFeedbackListItem['classId']) => classObj?.className,
        },
        {
            title: 'Điểm nổi bật',
            dataIndex: 'dailyHighlight',
            key: 'dailyHighlight',
            ellipsis: true,
            render: (text: string) => (
                <Tooltip title={text}>
                    <Tag color="cyan">{text}</Tag>
                </Tooltip>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center' as 'center',
            fixed: 'right' as 'right',
            width: 120,
            render: (_: any, record: IFeedbackListItem) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            type="link"
                            onClick={() => setSelectedFeedback(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Cập nhật">
                        {canUpdate && (
                            <Button
                                icon={<EditOutlined />}
                                type="link"
                                style={{ color: '#faad14' }}
                                onClick={() =>
                                    navigate(`${constants.APP_PREFIX}/feedbacks/edit/${record._id}`, {
                                        state: {
                                            studentName: record.studentId.fullName,
                                        },
                                    })
                                }

                            />
                        )}

                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card
            hoverable
            style={{
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
        >
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Select
                        showSearch
                        allowClear
                        placeholder="Tìm kiếm học sinh"
                        style={{ width: 300 }}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            typeof option?.children === 'string' ? (option.children as string).toLowerCase().includes(input.toLowerCase()) : false
                        }
                        onChange={(studentId) => {
                            if (!studentId) {
                                // Hiện tất cả nếu không chọn gì
                                fetchFeedbacks();
                                return;
                            }

                            const filtered = feedbacks.filter(f => f.studentId?._id === studentId);
                            setFeedbacks(filtered);
                        }}
                    >
                        {feedbacks.map((f) => (
                            <Option key={f.studentId._id} value={f.studentId._id}>
                                {f.studentId.fullName}
                            </Option>
                        ))}
                    </Select>

                </Col>
                <Col>
                    <Space size="middle" align="center" wrap>
                        <DatePicker
                            allowClear={false}
                            value={dayjs(date)}
                            onChange={(d) => setDate(d?.format('YYYY-MM-DD') || '')}
                            format="DD/MM/YYYY"
                        />
                        <Select
                            style={{ width: 200 }}
                            value={selectedClassId || undefined}
                            onChange={setSelectedClassId}
                            loading={isLoadingTeacherData}
                            placeholder="Chọn lớp"
                        >
                            {teacherData?.classes?.map((c: IClassInfo) => (
                                <Option key={c._id} value={c._id}>
                                    {c.className}
                                </Option>
                            ))}
                        </Select>
                        {canCreate && (
                            <Button
                                type="primary"
                                icon={<FormOutlined />}
                                onClick={() => navigate(`${constants.APP_PREFIX}/feedbacks/take-feedback`)}
                            >
                                Đánh giá hôm nay
                            </Button>
                        )}

                    </Space>
                </Col>
            </Row>

            <Spin spinning={loading} tip="Đang tải...">
                {feedbacks.length > 0 ? (
                    <Table
                        rowKey="_id"
                        columns={columns}
                        dataSource={feedbacks}
                        pagination={false}
                        size="middle"
                        scroll={{ x: 800 }}
                    />
                ) : (
                    <Empty description="Không có phản hồi nào trong ngày" />
                )}
            </Spin>

            <FeedbackDetailModal
                feedback={selectedFeedback}
                onClose={() => setSelectedFeedback(null)}
            />
        </Card>
    );
}

export default FeedBack;
