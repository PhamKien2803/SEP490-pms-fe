import React, { useState } from "react";
import {
  Card,
  Typography,
  Carousel,
  Image,
  Tag,
  Space,
  Button,
  Dropdown,
  Menu,
} from "antd";
import {
  ClockCircleOutlined,
  VideoCameraOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { Post } from "../../../../types/post";
import { postApis } from "../../../../services/apiServices";
import ModalConfirm from "../../../../modal/common/ModalConfirm/ModalConfirm";
import { toast } from "react-toastify";
import { usePagePermission } from "../../../../hooks/usePagePermission";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Text, Title, Paragraph } = Typography;

interface PostItemProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDeleteSuccess: () => void;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  onEdit,
  onDeleteSuccess,
}) => {
  const timeAgo = dayjs(post?.createdAt).fromNow();
  const detailedDate = dayjs(post?.createdAt).format("HH:mm, DD/MM/YYYY");
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);
  const { canUpdate } = usePagePermission();

  const mediaFiles = post.files.filter(
    (f) => f.fileType === "image" || f.fileType === "video"
  );

  const getMediaComponent = (file: any, index: number) => {
    if (file.fileType === "image") {
      return (
        <Image
          alt={`Post image ${index + 1}`}
          src={file.fileUrl}
          style={{
            width: "100%",
            height: "auto",
            minHeight: "400px",
            objectFit: "cover",
            backgroundColor: "#000",
          }}
          preview={{ mask: <span></span> }}
        />
      );
    } else if (file.fileType === "video") {
      return (
        <div style={{ position: "relative" }}>
          <video
            controls
            src={file.fileUrl}
            style={{
              width: "100%",
              height: 400,
              objectFit: "contain",
              backgroundColor: "#000",
            }}
          />
          <Tag
            icon={<VideoCameraOutlined />}
            color="#fa541c"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              fontSize: 12,
              padding: "2px 8px",
            }}
          >
            Video
          </Tag>
        </div>
      );
    }
    return null;
  };

  const handleDelete = async () => {
    setIsShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await postApis.deletePost(post.postId);
      toast.success("Bài viết đã được xóa thành công!");
      onDeleteSuccess();
    } catch (error: any) {
      toast.error(error || "Xóa bài viết thất bại. Vui lòng thử lại.");
    }
  };

  const menu = (
    <Menu onClick={(e) => e.domEvent.stopPropagation()}>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={(e) => {
          e.domEvent.stopPropagation();
          onEdit(post);
        }}
      >
        Chỉnh Sửa Bài Viết
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={handleDelete}
        danger
      >
        Xóa Bài Viết
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.3s",
      }}
      hoverable
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: "16px 16px 0 16px" }}>
        <Card.Meta
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space direction="horizontal" size={8}>
                <Text strong style={{ fontSize: "1.15em", color: "#333" }}>
                  {post.teacher.fullName}
                </Text>
                <Tag color="#2db7f5" style={{ fontSize: "0.8em" }}>
                  {post.class.className}
                </Tag>
              </Space>
              {canUpdate && (
                <Dropdown overlay={menu} trigger={["click"]}>
                  <Button
                    type="text"
                    icon={<MoreOutlined style={{ fontSize: 18 }} />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              )}
            </div>
          }
          description={
            <Text type="secondary" style={{ fontSize: "0.9em" }}>
              <ClockCircleOutlined style={{ marginRight: 4, color: "#999" }} />
              <span title={detailedDate}>{timeAgo}</span>
            </Text>
          }
        />
      </div>

      <div style={{ padding: 16 }}>
        <Title
          level={4}
          style={{
            marginTop: 0,
            marginBottom: 10,
            color: "#0050b3",
            fontWeight: 600,
          }}
        >
          {post.title}
        </Title>
        <Paragraph
          ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
          style={{
            whiteSpace: "pre-wrap",
            color: "#454545",
            lineHeight: "1.6",
          }}
        >
          {post.content}
        </Paragraph>
      </div>

      {mediaFiles.length > 0 && (
        <div
          style={{ borderTop: "1px solid #f0f0f0", backgroundColor: "#f9f9f9" }}
        >
          <Carousel
            arrows={mediaFiles.length > 1}
            infinite={false}
            dots={mediaFiles.length > 1}
            style={{ background: "#000" }}
          >
            {mediaFiles.map((file, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                {getMediaComponent(file, index)}
              </div>
            ))}
          </Carousel>
        </div>
      )}
      <ModalConfirm
        open={isShowConfirmDelete}
        loading={false}
        onClose={() => setIsShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Bạn có chắc chắn muốn xóa thực đơn này không? Hành động này không thể hoàn tác."
      />
    </Card>
  );
};

export default PostItem;
