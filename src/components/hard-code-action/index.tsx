const hardcodedActions = [
    { label: 'Xem', value: 'view' },
    { label: 'Tạo', value: 'create' },
    { label: 'Sửa', value: 'update' },
    { label: 'Xóa', value: 'delete' },
    { label: 'Duyệt đơn', value: 'approve' },
    { label: 'Xuất file', value: 'export' },
    { label: 'Nhập file', value: 'import' },
    { label: 'Từ chối', value: 'reject' },
    { label: 'Duyệt tất cả', value: 'approve_all' },
    { label: 'Đồng bộ dữ liệu', value: 'sync_data' },
    { label: 'Khóa', value: 'lock' },
    { label: 'Mở khóa', value: 'un_lock' },
];

const ageOptions = [
    { value: 1, label: '1 tuổi' },
    { value: 2, label: '2 tuổi' },
    { value: 3, label: '3 tuổi' },
    { value: 4, label: '4 tuổi' },
    { value: 5, label: '5 tuổi' },
];

const categoryOptions = [
    "Phát triển thể chất",
    "Phát triển nhận thức",
    "Phát triển ngôn ngữ",
    "Phát triển tình cảm",
    "Phát triển thẩm mỹ",
    "Phát triển kỹ năng xã hội",
    "Hoạt động sự kiện"
];

export { hardcodedActions, ageOptions, categoryOptions };