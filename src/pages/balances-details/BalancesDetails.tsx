import { useEffect, useState, useMemo } from "react";
import {
    Card,
    Table,
    Typography,
    Tag,
    Statistic,
    Flex,
    Form,
    Select,
    Button,
    Spin
} from "antd";
import { WalletOutlined, ReloadOutlined } from "@ant-design/icons";
import { BalanceTransaction } from "../../types/balances";
import { balancesApis } from "../../services/apiServices";
import { formatCurrency, formatDateTime } from "../../utils/format";

const { Title, Text } = Typography;
const { Option } = Select;

function BalancesDetails() {
    const [form] = Form.useForm();
    const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("all");

    const fetchBalance = async () => {
        try {
            setLoading(true);
            const res = await balancesApis.getBalanceDetail();
            setBalance(res.currentBalance);
            setTransactions(res.transactions);
            setFilterType("all");
            form.setFieldsValue({ type: "all" });
        } catch {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    const filteredTransactions = useMemo(() => {
        if (filterType === "all") {
            return transactions;
        }
        return transactions.filter((t) => t.type === filterType);
    }, [transactions, filterType]);

    const columns = [
        {
            title: "Mã giao dịch",
            dataIndex: "transactionCode",
            key: "transactionCode",
            render: (code: string) => <Text strong>{code}</Text>,
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            render: (type: string) => {
                const color = type === "Tiền thu" ? "success" : "error";
                return <Tag color={color}>{type.toUpperCase()}</Tag>;
            },
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            align: "right" as "right",
            render: (amount: number, record: BalanceTransaction) => {
                const color = record.type === "Tiền thu" ? "#3f8600" : "#cf1322";
                const prefix = record.type === "Tiền thu" ? "+ " : "- ";
                return (
                    <Text style={{ color, fontWeight: 500 }}>
                        {prefix}
                        {formatCurrency(amount)}
                    </Text>
                );
            },
        },
        {
            title: "Số dư trước",
            dataIndex: "balanceBefore",
            key: "balanceBefore",
            align: "right" as "right",
            render: formatCurrency,
        },
        {
            title: "Số dư sau",
            dataIndex: "balanceAfter",
            key: "balanceAfter",
            align: "right" as "right",
            render: formatCurrency,
        },
        {
            title: "Nguồn",
            dataIndex: "source",
            key: "source",
            render: (src: string) => <Text>{src}</Text>,
        },
        {
            title: "Ghi chú",
            dataIndex: "note",
            key: "note",
        },
        {
            title: "Thời gian",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => formatDateTime(date),
        },
    ];

    return (
        <Spin spinning={loading}>
            <Flex vertical gap="large">
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
                    <Title level={4} style={{ margin: 0 }}>
                        Chi Tiết Ví Hệ Thống
                    </Title>
                    <Card style={{ background: "#f6ffed" }}>
                        <Statistic
                            title="Số dư hiện tại"
                            value={balance}
                            precision={0}
                            valueStyle={{ color: "#3f8600", fontWeight: "bold", fontSize: 24 }}
                            prefix={<WalletOutlined />}
                            suffix="VNĐ"
                        />
                    </Card>
                </Flex>

                <Card>
                    <Form
                        form={form}
                        layout="inline"
                        onValuesChange={(changedValues) => {
                            if (changedValues.type) {
                                setFilterType(changedValues.type);
                            }
                        }}
                        initialValues={{ type: "all" }}
                        style={{ marginBottom: 20 }}
                    >
                        <Form.Item name="type" label="Loại giao dịch">
                            <Select style={{ width: 150 }}>
                                <Option value="all">Tất cả</Option>
                                <Option value="Tiền thu">Tiền thu</Option>
                                <Option value="Tiền chi">Tiền chi</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchBalance}
                                loading={loading}
                            >
                                Làm mới
                            </Button>
                        </Form.Item>
                    </Form>

                    <Table
                        dataSource={filteredTransactions}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 10, showSizeChanger: false }}
                        columns={columns}
                        scroll={{ x: 'max-content' }}
                    />
                </Card>
            </Flex>
        </Spin>
    );
}

export default BalancesDetails;