import { Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function UploadFile({
  dataList = [],
  setDataList,
  disabled,
  type,
}) {
  return (
    <Upload
      fileList={dataList}
      disabled={disabled}
      beforeUpload={(file) => {
        setDataList?.([...dataList, file]);
        return false;
      }}
      onRemove={(file) =>
        setDataList?.(dataList.filter((item) => item.uid !== file.uid))
      }
    >
      <Button type={type} disabled={disabled} icon={<UploadOutlined />}>
        上传文件
      </Button>
    </Upload>
  );
}
