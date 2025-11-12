import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Typography,
  Card,
  Row,
  Col,
  Space,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  VideoCameraOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { UploadFile } from "antd/lib/upload/interface";
import { FileInfo, Post } from "../../../types/post";
import { postApis } from "../../../services/apiServices";
import { toast } from "react-toastify";
import Image from "antd/lib/image";

const { TextArea } = Input;
const { Title, Text } = Typography;

const MAX_PHOTOS = 10;

interface FormValues {
  title: string;
  content: string;
}

interface EditPostProps {
  post: Post;
  onEditSuccess: () => void;
  onCancel: () => void;
}

const EditPost: React.FC<EditPostProps> = ({
  post,
  onEditSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [existingMedia, setExistingMedia] = useState<FileInfo[]>(
    post.files || []
  );

  useEffect(() => {
    form.setFieldsValue({
      title: post.title,
      content: post.content,
    });
  }, [post, form]);

  const handleUploadChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    const filteredFileList = newFileList.filter(
      (f) => f.status !== "removed" && f.status !== "error"
    );

    const totalMedia = existingMedia.length + filteredFileList.length;
    if (totalMedia > MAX_PHOTOS) {
      message.warning(
        `Tổng số ảnh/video (cũ và mới) không được vượt quá ${MAX_PHOTOS}.`
      );
      setFileList(filteredFileList.slice(0, MAX_PHOTOS - existingMedia.length));
    } else {
      setFileList(filteredFileList);
    }
  };

  const handleRemoveExistingMedia = async (mediaId: string) => {
    try {
      setIsLoading(true);

      await postApis.deleteImage(mediaId);

      toast.success("Đã xóa media thành công.");
      setExistingMedia((prev) => prev.filter((media) => media._id !== mediaId));
    } catch (error: any) {
      console.error("Lỗi xóa media:", error);
      toast.error(error?.message || "Xóa media thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const onFinish = async (values: FormValues) => {
    const { title, content } = values;

    const newFilesToUpload = fileList
      .map((f) => f.originFileObj as File)
      .filter(Boolean);

    if (!title || !content) {
      toast.error("Vui lòng điền đầy đủ Tiêu đề và Nội dung.");
      return;
    }

    if (existingMedia.length + newFilesToUpload.length > MAX_PHOTOS) {
      toast.error(
        `Tổng số media không được vượt quá ${MAX_PHOTOS}. Vui lòng xóa bớt.`
      );
      return;
    }

    setIsLoading(true);
    try {
      const updateParams = {
        postId: post.postId,
        classId: post?.class?._id,
        teacherId: post?.teacher?._id,
        title,
        content,
      };

      await postApis.updatePost(post.postId, updateParams);

      if (newFilesToUpload.length > 0) {
        const key = "uploadKey";
        message.loading({
          content: `Cập nhật nội dung thành công, đang tải ${newFilesToUpload.length} ảnh/video mới...`,
          key,
          duration: 0,
        });

        await postApis.uploadAlbum(post.postId, newFilesToUpload);
        message.destroy(key);
        toast.success("Cập nhật bài viết và album ảnh thành công!");
      } else {
        toast.success("Cập nhật bài viết thành công!");
      }

      setFileList([]);
      onEditSuccess();
    } catch (error: any) {
      console.error("Lỗi cập nhật bài viết:", error);
      toast.error(error?.message || "Đã xảy ra lỗi. Vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  const currentTotalMedia = existingMedia.length + fileList.length;

  return (
    <div
      style={{
        padding: "24px 0",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Row justify="center">
        <Col xs={24} sm={20} md={18} lg={12} xl={10}>
          <Card
            style={{
              marginBottom: 24,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
            }}
          >
            <Space
              align="center"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Button
                type="text"
                onClick={onCancel}
                icon={<ArrowLeftOutlined />}
                size="large"
                style={{ fontWeight: "bold" }}
              >
                Quay lại
              </Button>
              <Title level={3} style={{ margin: 0, color: "#faad14" }}>
                <EditOutlined style={{ marginRight: 8 }} /> Chỉnh Sửa
              </Title>
            </Space>
            <Text
              type="secondary"
              style={{ display: "block", textAlign: "right", marginTop: 5 }}
            >
              Bài viết của: {post?.teacher?.fullName}
            </Text>
          </Card>
          <Card
            style={{
              padding: 24,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Form
              form={form}
              name="edit-post-form"
              onFinish={onFinish}
              layout="vertical"
            >
              <Form.Item
                name="title"
                label={<Text strong>Tiêu đề</Text>}
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
              >
                <Input
                  placeholder="Tiêu đề bài viết..."
                  disabled={isLoading}
                  size="large"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>

              <Form.Item
                name="content"
                label={<Text strong>Nội dung</Text>}
                rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
              >
                <TextArea
                  rows={6}
                  placeholder="Nội dung bài viết"
                  disabled={isLoading}
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>

              <Text
                strong
                style={{
                  display: "block",
                  fontSize: "18px",
                  marginBottom: 10,
                }}
              >
                Quản Lý Ảnh/Video ({currentTotalMedia}/{MAX_PHOTOS})
              </Text>

              {existingMedia.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <Text
                    type="secondary"
                    style={{
                      display: "block",
                      marginBottom: 10,
                      color: "#1890ff",
                      marginTop: "5px",
                    }}
                  >
                    Media đã có ({existingMedia.length}):
                  </Text>
                  <Row gutter={[16, 16]}>
                    {existingMedia.map((file) => (
                      <Col key={file._id} xs={8} sm={6} md={4}>
                        <div
                          style={{
                            width: "100%",
                            paddingTop: "100%",
                            position: "relative",
                            borderRadius: 8,
                            border: "1px solid #d9d9d9",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {file.fileType === "image" ? (
                              <Image
                                src={file.fileUrl}
                                alt="old media"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                preview={false}
                              />
                            ) : (
                              <div
                                style={{
                                  backgroundColor: "#262626",
                                  height: "100%",
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <VideoCameraOutlined
                                  style={{ fontSize: 30, color: "#faad14" }}
                                />
                              </div>
                            )}
                            <Button
                              icon={<DeleteOutlined />}
                              danger
                              type="primary"
                              shape="circle"
                              size="small"
                              style={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                zIndex: 10,
                                backgroundColor: "rgba(255, 0, 0, 0.7)",
                                borderColor: "transparent",
                              }}
                              onClick={() =>
                                handleRemoveExistingMedia(file._id)
                              }
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              <div style={{ marginTop: existingMedia.length > 0 ? 30 : 0 }}>
                <Text strong style={{ display: "block", marginBottom: 10 }}>
                  Thêm Ảnh/Video Mới:
                </Text>
                <Form.Item
                  name="new_images"
                  valuePropName="fileList"
                  getValueFromEvent={handleUploadChange}
                  noStyle
                >
                  <Upload
                    listType="picture-card"
                    multiple
                    accept="image/*,video/*"
                    beforeUpload={() => false}
                    fileList={fileList}
                    onChange={handleUploadChange}
                    maxCount={MAX_PHOTOS - existingMedia.length}
                    disabled={isLoading || currentTotalMedia >= MAX_PHOTOS}
                  >
                    {currentTotalMedia < MAX_PHOTOS && (
                      <div style={{ color: "#1890ff" }}>
                        <UploadOutlined style={{ fontSize: 20 }} />
                        <div style={{ marginTop: 8 }}>Tải lên</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </div>

              <Form.Item style={{ marginTop: 40, marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  block
                  size="large"
                  style={{ fontWeight: "bold", borderRadius: 6 }}
                >
                  {isLoading ? "Đang Cập Nhật..." : "Lưu Thay Đổi"}
                </Button>
                <Button
                  onClick={onCancel}
                  block
                  size="large"
                  disabled={isLoading}
                  style={{ marginTop: 10, borderRadius: 6 }}
                >
                  Hủy Bỏ
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EditPost;
