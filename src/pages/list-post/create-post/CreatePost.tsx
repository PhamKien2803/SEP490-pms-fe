import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { UploadFile } from "antd/lib/upload/interface";
import { CreatePostParams } from "../../../types/post";
import { postApis } from "../../../services/apiServices";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { toast } from "react-toastify";

const { TextArea } = Input;

const MAX_PHOTOS = 10;

interface FormValues {
  title: string;
  content: string;
  images: { fileList: UploadFile[] };
}

interface CreatePostProps {
  onPostSuccess: () => void;
  onCancel: () => void; 
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const user = useCurrentUser();

  const handleUploadChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    const filteredList = newFileList.slice(-MAX_PHOTOS);
    setFileList(filteredList);

    if (newFileList.length > MAX_PHOTOS) {
      message.warning(`Bạn chỉ có thể chọn tối đa ${MAX_PHOTOS} ảnh.`);
    }
  };

  const onFinish = async (values: FormValues) => {
    const { title, content } = values;
    const filesToUpload = fileList
      .map((f) => f.originFileObj as File)
      .filter(Boolean);

    if (!title || !content) {
      toast.error("Vui lòng điền đầy đủ Tiêu đề và Nội dung.");
      return;
    }
    if (!user?.staff) {
      toast.error("Không tìm thấy thông tin giáo viên.");
      return;
    }

    setIsLoading(true);

    try {
      const classResponse = await postApis.getClass(user.staff);

      const postParams: CreatePostParams = {
        classId: classResponse?.classes?._id || "",
        teacherId: user.staff,
        title,
        content,
      };

      const createPostResult = await postApis.createNewPost(postParams);
      const postId = createPostResult?._id;

      if (!postId) {
        throw new Error("Không nhận được ID bài viết sau khi tạo.");
      }

      message.loading({
        content: `Bài post tạo thành công, đang tải ${filesToUpload.length} ảnh...`,
        key: "uploadKey",
        duration: 0,
      });

      if (filesToUpload.length > 0) {
        await postApis.uploadAlbum(postId, filesToUpload);
        toast.success("Đăng bài post và album ảnh thành công!");
      } else {
        toast.success("Đăng bài post chỉ có nội dung thành công!");
      }

      form.resetFields();
      setFileList([]);
      onPostSuccess(); 
    } catch (error: any) {
      toast.error(error || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, paddingTop: 0 }}>
      <Form
        form={form}
        name="create-post-form"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input
            placeholder="Tiêu đề bài viết..."
            disabled={isLoading}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="content"
          rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
          style={{ marginBottom: 12 }}
        >
          <TextArea
            rows={5}
            placeholder="Bạn muốn chia sẻ điều gì hôm nay?"
            disabled={isLoading}
          />
        </Form.Item>

        <Form.Item
          label={`Ảnh/Video (Tối đa ${MAX_PHOTOS})`}
          name="images"
          valuePropName="fileList"
          getValueFromEvent={handleUploadChange}
          style={{ marginBottom: 20 }}
        >
          <Upload
            listType="picture-card"
            multiple
            accept="image/*,video/*"
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleUploadChange}
            maxCount={MAX_PHOTOS}
            disabled={isLoading}
          >
            {fileList.length < MAX_PHOTOS && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item style={{ margin: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
          >
            {isLoading ? "Đang Đăng Bài..." : "Đăng Bài Ngay"}
          </Button>
          <Button
            onClick={onCancel}
            block
            size="large"
            disabled={isLoading}
            style={{ marginTop: 10 }}
          >
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreatePost;
