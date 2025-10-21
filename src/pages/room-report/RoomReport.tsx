import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Button, Space, Typography, Row, Col, Card, Select, Tag, Modal, App, Tooltip } from 'antd';
import { DownloadOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import { roomApis } from '../../services/apiServices';
import { useExcelExport } from '../../hooks/useExcelExport';
import { usePagePermission } from "../../hooks/usePagePermission";
import dayjs from 'dayjs';
import { FacilityExportRecord, RoomRecord, RoomState, UpdateRoomData } from '../../types/room-management';
const { Title, Text } = Typography;

const PENDING_STATE: RoomState = 'Chờ xử lý' as RoomState;
const APPROVED_STATE: RoomState = 'Hoàn thành' as RoomState;

const RoomReportComponent: React.FC = () => {
    const { canExportfile } = usePagePermission();
    const [allRooms, setAllRooms] = useState<RoomRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

    const [isProcessing, setIsProcessing] = useState(false);
    const [modal, contextHolder] = Modal.useModal();

    const fetchAllRooms = useCallback(async () => {
        setLoading(true);
        try {
            const response = await roomApis.getListRoom({ page: 1, limit: 1000 });
            setAllRooms(response.data);
        } catch (error) {
            toast.error('Không thể tải danh sách phòng học cho báo cáo.');
            setAllRooms([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllRooms();
    }, [fetchAllRooms]);

    const filteredData = useMemo(() => {
        return allRooms
            .filter(item => item.state === PENDING_STATE || item.state === APPROVED_STATE)
            .filter(item => {
                if (!selectedYear) return true;
                return dayjs(item.createdAt).year() === selectedYear;
            });
    }, [allRooms, selectedYear]);

    const updateRoomData = async (roomData: RoomRecord, newState: RoomState) => {
        if (roomData.state !== PENDING_STATE) {
            toast.warn(`Phòng ${roomData.roomName} đang ở trạng thái ${roomData.state} và không thể duyệt.`);
            return;
        }

        setIsProcessing(true);
        try {
            const payload: UpdateRoomData = {
                roomName: roomData.roomName,
                roomType: roomData.roomType,
                capacity: roomData.capacity,
                facilities: roomData.facilities.map(f => ({
                    facilityName: f.facilityName,
                    facilityType: f.facilityType,
                    quantity: f.quantity,
                    quantityDefect: f.quantityDefect,
                    quantityMissing: f.quantityMissing,
                    notes: f.notes,
                })),
                state: newState,
                notes: roomData.notesTeacher,
                createdBy: roomData.createdBy,
                updatedBy: roomData.updatedBy,
            };

            await roomApis.updateRoom(roomData._id, payload);

            toast.success(`Phòng học ${roomData.roomName} đã được duyệt!`);
            await fetchAllRooms();
        } catch (error) {
            toast.error(`Cập nhật trạng thái thất bại.`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApprove = (record: RoomRecord) => {
        if (record.state !== PENDING_STATE) {
            toast.warn(`Chỉ có thể duyệt báo cáo ở trạng thái "${PENDING_STATE}".`);
            return;
        }

        modal.confirm({
            title: 'Xác nhận Duyệt Báo cáo',
            content: `Bạn có chắc chắn muốn DUYỆT báo cáo vật chất cho phòng ${record.roomName} không?`,
            okText: 'Duyệt',
            cancelText: 'Hủy',
            okButtonProps: { type: 'primary' },
            onOk: () => updateRoomData(record, APPROVED_STATE),
        });
    };

    const getExportDataForRoom = (room: RoomRecord): FacilityExportRecord[] => {
        const data: FacilityExportRecord[] = [];
        room.facilities.forEach(facility => {
            if (facility.quantityDefect > 0 || facility.quantityMissing > 0) {
                data.push({
                    'Mã Phòng': room._id,
                    'Tên Phòng': room.roomName,
                    'Tên Thiết Bị': facility.facilityName,
                    'Loại Thiết Bị': facility.facilityType,
                    'SL Tổng': facility.quantity,
                    'SL Hỏng/Lỗi': facility.quantityDefect,
                    'SL Thiếu': facility.quantityMissing,
                    'Ghi Chú GV': facility.notes || 'Không có',
                    'Trạng Thái Phòng': room.state,
                    'Ngày Cập Nhật': dayjs(room.updatedAt).format('DD/MM/YYYY HH:mm'),
                });
            }
        });
        return data;
    };

    const exportDataTotal = useMemo<FacilityExportRecord[]>(() => {
        const data: FacilityExportRecord[] = [];
        allRooms
            .filter(room => room.state === PENDING_STATE)
            .filter(item => {
                if (!selectedYear) return true;
                return dayjs(item.createdAt).year() === selectedYear;
            })
            .forEach(room => {
                room.facilities.forEach(facility => {
                    if (facility.quantityDefect > 0 || facility.quantityMissing > 0) {
                        data.push({
                            'Mã Phòng': room._id,
                            'Tên Phòng': room.roomName,
                            'Tên Thiết Bị': facility.facilityName,
                            'Loại Thiết Bị': facility.facilityType,
                            'SL Tổng': facility.quantity,
                            'SL Hỏng/Lỗi': facility.quantityDefect,
                            'SL Thiếu': facility.quantityMissing,
                            'Ghi Chú GV': facility.notes || 'Không có',
                            'Trạng Thái Phòng': room.state,
                            'Ngày Cập Nhật': dayjs(room.updatedAt).format('DD/MM/YYYY HH:mm'),
                        });
                    }
                });
            });
        return data;
    }, [allRooms, selectedYear]);

    const { exportToExcel, isExporting: isExportingExcel, exportDetailsToExcel, isExportingDetails } = useExcelExport({
        data: exportDataTotal,
        fileName: `BC_CSVC_BaoCaoTongHop_${selectedYear}_${dayjs().format('YYYYMMDD')}`,
    });

    // const handleExportRoomDetails = (record: RoomRecord) => {
    //     const dataToExport = getExportDataForRoom(record);
    //     if (dataToExport.length === 0) {
    //         toast.info(`Phòng ${record.roomName} không có thiết bị hỏng hoặc thiếu nào cần báo cáo.`);
    //         return;
    //     }
    //     exportToExcel({
    //         data: dataToExport,
    //         fileName: `BC_Loi_${record.roomName}_${dayjs().format('YYYYMMDDHHmmss')}`,
    //     });
    // };
    const handleExportRoomDetails = (record: RoomRecord) => {
        const dataToExport = getExportDataForRoom(record);
        if (dataToExport.length === 0) {
            toast.info(`Phòng ${record.roomName} không có thiết bị hỏng hoặc thiếu nào cần báo cáo.`);
            return;
        }
        exportDetailsToExcel({
            data: dataToExport,
            fileName: `BC_Loi_${record.roomName}_${dayjs().format('YYYYMMDDHHmmss')}`,
            sheetName: record.roomName
        });
    };


    const getTagColor = (state: RoomState) => {
        switch (state) {
            case PENDING_STATE:
                return 'gold';
            case APPROVED_STATE:
                return 'success';
            default:
                return 'default';
        }
    }

    const columns: ColumnsType<RoomRecord> = useMemo(() => [
        {
            title: 'Mã Phòng',
            dataIndex: '_id',
            key: '_id',
            width: 100,
            render: (text) => <Text copyable>{text.slice(-6)}</Text>
        },
        {
            title: 'Tên Phòng',
            dataIndex: 'roomName',
            key: 'roomName',
            width: 200,
            render: (text, record) => (
                <Button type="link" onClick={() => (window as any).navigate(`/rooms/view/${record._id}`)}>
                    {text}
                </Button>
            )
        },
        {
            title: 'Loại Phòng',
            dataIndex: 'roomType',
            key: 'roomType',
            width: 150
        },
        {
            title: 'Ngày Báo Cáo',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 160,
            render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'state',
            key: 'state',
            width: 150,
            render: (state: RoomState) => (
                <Tag color={getTagColor(state)}>
                    {state}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 180,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    {record.state === PENDING_STATE && (
                        <Button
                            icon={<CheckCircleOutlined />}
                            type="primary"
                            size="small"
                            onClick={() => handleApprove(record)}
                            loading={isProcessing}
                            disabled={isProcessing}
                        >
                            Duyệt
                        </Button>
                    )}

                    <Button
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => handleExportRoomDetails(record)}
                        loading={isExportingDetails}
                        disabled={isProcessing}
                    >
                        Chi tiết
                    </Button>
                </Space>
            ),
        },
    ], [isProcessing, exportToExcel]);

    const generateYearOptions = () => {
        const currentYear = dayjs().year();
        const years = [];
        for (let i = currentYear; i >= currentYear - 5; i--) {
            years.push({ value: i, label: `Năm ${i}` });
        }
        return years;
    };

    const yearOptions = useMemo(generateYearOptions, []);

    return (
        <div style={{ padding: '24px' }}>
            {contextHolder}
            <Card style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>
                            Báo cáo CSVC Phòng học
                        </Title>
                    </Col>
                    <Col>
                        <Space>
                            <Text strong>Lọc theo năm:</Text>
                            <Select
                                value={selectedYear}
                                style={{ width: 150 }}
                                onChange={(value) => setSelectedYear(value)}
                                options={yearOptions}
                                placeholder="Chọn năm"
                            />
                            <Tooltip title="Làm mới danh sách">
                                <Button icon={<ReloadOutlined />}
                                    onClick={fetchAllRooms}
                                    loading={loading}></Button>
                            </Tooltip>
                            {canExportfile && (
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={() => exportToExcel()}
                                    loading={isExportingExcel}
                                >
                                    Xuất Báo cáo Tổng hợp
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    loading={loading}
                    rowKey="_id"
                    bordered
                    pagination={{
                        showTotal: (total) => `Tổng số: ${total} báo cáo`,
                        pageSizeOptions: [10, 20, 50],
                        showSizeChanger: true,
                    }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </div>
    );
};

const RoomReport: React.FC = () => (
    <App>
        <RoomReportComponent />
    </App>
);

export default RoomReport;