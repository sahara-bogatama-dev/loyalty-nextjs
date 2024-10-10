"use client";

import React from "react";
import {
  Button,
  Layout,
  theme,
  Breadcrumb,
  Card,
  Form,
  Input,
  message,
  ConfigProvider,
  Row,
  Col,
  InputNumber,
  Upload,
  DatePicker,
  Modal,
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import HeaderBar from "@/app/component/header.comp";
import {
  DataGridPremium,
  GridActionsCellItem,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import { Box, Pagination } from "@mui/material";
import _ from "lodash";
import moment from "moment";
import { MdAddPhotoAlternate, MdCancel, MdPhoto } from "react-icons/md";
import { RcFile, UploadProps } from "antd/es/upload";
import getBase64 from "@/lib/arrayBufferToBase64";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { FaEdit, FaFileImage, FaInbox, FaSave } from "react-icons/fa";
import {
  addPackages,
  changeImagePackage,
  deletePackages,
  listPackage,
  updatePackage,
} from "@/controller/redeemPackage/action";
import { FaTrashCan } from "react-icons/fa6";
import dayjs from "dayjs";

export default function Home() {
  const { Content } = Layout;
  const { Dragger } = Upload;

  const [baseUrl, setBaseUrl] = React.useState("");

  const [addForm] = Form.useForm();

  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingTable, setLoadingTable] = React.useState(false);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const [openImage, setOpenImage] = React.useState(false);

  const [packageId, setPackageId] = React.useState("");

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [packageList, setPackageList] = React.useState<any[]>([]);

  const fetchListPackage = React.useCallback(async () => {
    setLoadingTable(true);
    const packageRedeem = await listPackage();
    if (packageRedeem.success) {
      setPackageList(packageRedeem.value.result as any);
    } else {
      console.log(packageRedeem.error);
      messageApi.open({
        type: "error",
        content: packageRedeem.error,
      });
    }
    setLoadingTable(false);
  }, [messageApi]);

  React.useEffect(() => {
    fetchListPackage();

    const { protocol, hostname, port } = window.location;
    setBaseUrl(`${protocol}//${hostname}${port ? `:${port}` : ""}`);
  }, [fetchListPackage]);

  const validateFile = async (file: RcFile) => {
    const maxSize = 500 * 1024;
    const maxWidth = 864;
    const maxHeight = 400;

    return new Promise<void>((resolve, reject) => {
      if (file.size > maxSize) {
        reject("File size must be smaller than 500KB!");
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (img.width !== maxWidth && img.height !== maxHeight) {
          reject("Image dimensions must not exceed 864x400 pixels!");
        } else {
          resolve();
        }
      };
      img.onerror = () => {
        reject("Invalid image file!");
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.onerror = () => {
        reject("Error reading file!");
      };
      reader.readAsDataURL(file);
    });
  };

  const validateUpload = (rule: any, value: any) => {
    if (!value || value.fileList.length === 0) {
      return Promise.reject("Please upload an image!");
    }

    return validateFile(value.fileList[0].originFileObj)
      .then(() => Promise.resolve())
      .catch((error) => Promise.reject(error));
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleDeleteClick = (id: GridRowId) => async () => {
    const deletes = await deletePackages({ packageId: id.toString() });

    if (deletes.success) {
      setPackageList(packageList.filter((row) => row.packageId !== id));
    } else {
      messageApi.open({
        type: "error",
        content: deletes.error,
      });
    }
  };

  const handleImageClick = (id: GridRowId) => () => {
    setOpenImage(true);
    setPackageId(id.toString());
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    const updateRow = await updatePackage({
      packageId: newRow.packageId,
      packageName: newRow.packageName,
      costPoint: Number(newRow.costPoint),
      limit: Number(newRow.limit),
      description: newRow.description,
      inActive: newRow.inActive,
      updatedBy: session?.user?.name ?? "",
    });

    if (updateRow.success) {
      setPackageList((prevRows) =>
        prevRows.map((row) =>
          row.packageId === newRow.packageId
            ? {
                ...newRow,
                updatedAt: dayjs().toDate(),
                updatedBy: session?.user?.name ?? "",
              }
            : row
        )
      );
      return newRow;
    } else {
      messageApi.open({
        type: "error",
        content: updateRow.error,
      });
      setRowModesModel({
        ...rowModesModel,
        [newRow.campaignId]: {
          mode: GridRowModes.View,
          ignoreModifications: true,
        },
      });
    }
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const props: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept: ".jpeg,.jpg",
    beforeUpload(file) {
      const maxSize = 500 * 1024;
      const maxWidth = 864;
      const maxHeight = 400;

      return new Promise<void>((resolve, reject) => {
        if (file.size > maxSize) {
          messageApi.open({
            type: "error",
            content: "File size must be smaller than 500KB!",
          });

          return Upload.LIST_IGNORE;
        }

        const img = new Image();
        img.onload = () => {
          if (img.width !== maxWidth && img.height !== maxHeight) {
            messageApi.open({
              type: "error",
              content: "Image dimensions must not exceed 864x400 pixels!",
            });
            reject("Image dimensions must not exceed 864x400 pixels!");
          } else {
            resolve();
          }
        };
        img.onerror = () => {
          reject("Invalid image file!");
        };

        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            img.src = e.target.result as string;
          }
        };
        reader.onerror = () => {
          reject("Error reading file!");
        };
        reader.readAsDataURL(file);
      });
    },
    async onChange(info) {
      const { status, originFileObj } = info.file;

      if (status === "done") {
        const base64 = (await getBase64(originFileObj as RcFile)) as string;

        const uploadIMG = await changeImagePackage({
          packageId: packageId,
          image: base64.replace(/^data:image\/[a-z]+;base64,/, ""),
          updatedBy: session?.user?.name ?? "",
        });
        if (uploadIMG.success) {
          messageApi.success("Upload complete.");
        } else {
          messageApi.error(uploadIMG.error);
        }
      } else if (status === "error") {
        messageApi.open({
          type: "error",
          content: "Image upload failed.",
        });
      }
    },
  };

  return (
    <Layout>
      {contextHolder}
      <SideBar
        collapsed={collapsed}
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
        session={session}
      />
      <Layout style={{ height: "100vh", overflowY: "auto" }}>
        <HeaderBar onCollapsed={() => setCollapsed(!collapsed)} />

        <Content
          style={{
            margin: "0px 16px",
          }}
        >
          <Breadcrumb
            items={[
              { title: "Main", href: "/" },
              { title: "Package Redeem", href: "/pages/package-redeem" },
            ]}
            style={{ margin: "16px 0" }}
          />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <div className="flex justify-center">
              <Card size="small" title="Buat Campaign" bordered={true}>
                <Form
                  name="addPackage"
                  className="gap-10"
                  form={addForm}
                  onFinish={async (value) => {
                    try {
                      const base64 = (await getBase64(
                        value.addImg.file
                      )) as string;

                      setLoading(true);

                      const createdPackage = await addPackages({
                        packageName: value.packageName,
                        costPoint: value.point,
                        limit: value.limit,
                        description: value.desc,
                        createdBy: session?.user?.name ?? "",
                        image: base64.replace(
                          /^data:image\/[a-z]+;base64,/,
                          ""
                        ),
                      });

                      if (createdPackage.success) {
                        messageApi.open({
                          type: "success",
                          content: "Package redeem sudah ditambahkan.",
                        });

                        addForm.resetFields();
                        fetchListPackage();
                      } else {
                        messageApi.open({
                          type: "error",
                          content: createdPackage.error,
                        });
                      }
                      setLoading(false);
                    } catch (e: any) {
                      messageApi.open({
                        type: "error",
                        content: e.message,
                      });
                    }
                  }}
                  autoComplete="off"
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Package Name"
                        name="packageName"
                        rules={[
                          {
                            required: true,
                            message: "Please input your Campaign name!",
                          },
                          {
                            max: 255,
                            message: "Max length Campaign name!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Point"
                        name="point"
                        rules={[
                          {
                            required: true,
                            message: "Please input your expired period!",
                          },
                        ]}
                      >
                        <InputNumber addonAfter="Point" className="w-full" />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Description"
                        name="desc"
                        rules={[
                          {
                            required: true,
                            message: "Please input your description!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Limit"
                        name="limit"
                        rules={[
                          {
                            required: true,
                            message: "Please input your limit!",
                          },
                        ]}
                      >
                        <InputNumber addonAfter="Limit" className="w-full" />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Upload Image"
                        name="addImg"
                        rules={[
                          {
                            validator: validateUpload,
                          },
                        ]}
                      >
                        <Upload
                          listType="picture-card"
                          multiple={false}
                          accept=".jpeg,.jpg"
                          beforeUpload={(file) => {
                            validateFile(file).catch(() => false);
                            return false;
                          }}
                          maxCount={1}
                        >
                          <button
                            style={{
                              border: 0,
                              background: "none",
                            }}
                            type="button"
                          >
                            <MdAddPhotoAlternate className="text-3xl" />
                            <div style={{ marginTop: 8 }}>Upload</div>
                          </button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                    <ConfigProvider theme={{ token: { colorPrimary: "red" } }}>
                      <Button
                        loading={loading}
                        type="primary"
                        htmlType="submit"
                        block
                      >
                        Add Package
                      </Button>
                    </ConfigProvider>
                  </Form.Item>
                </Form>
              </Card>
            </div>

            <div style={{ height: 500, width: "100%", marginTop: 10 }}>
              <DataGridPremium
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                slots={{
                  toolbar: () => (
                    <GridToolbarContainer>
                      <GridToolbarQuickFilter />
                      <GridToolbarColumnsButton />
                      <GridToolbarFilterButton />
                      <GridToolbarDensitySelector
                        slotProps={{ tooltip: { title: "Change density" } }}
                      />
                      <Box sx={{ flexGrow: 1 }} />
                      <GridToolbarExport
                        slotProps={{
                          tooltip: { title: "Export data" },
                          button: { variant: "outlined" },
                        }}
                      />
                    </GridToolbarContainer>
                  ),
                }}
                loading={loadingTable}
                pageSizeOptions={[10, 100, 1000]}
                pagination
                disableRowSelectionOnClick
                headerFilters
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 1000, page: 0 },
                  },
                }}
                rowSelection={false}
                rows={packageList}
                getRowId={(row) => row.packageId}
                columns={[
                  {
                    field: "actions",
                    type: "actions",
                    headerName: "Actions",
                    width: 250,
                    cellClassName: "actions",
                    getActions: ({ id }) => {
                      const isInEditMode =
                        rowModesModel[id]?.mode === GridRowModes.Edit;

                      if (isInEditMode) {
                        return [
                          <GridActionsCellItem
                            key={id.toString()}
                            icon={<FaSave />}
                            label="Save"
                            sx={{
                              color: "primary.main",
                            }}
                            onClick={handleSaveClick(id)}
                          />,
                          <GridActionsCellItem
                            key={id.toString()}
                            icon={<MdCancel />}
                            label="Cancel"
                            className="textPrimary"
                            color="inherit"
                            onClick={handleCancelClick(id)}
                          />,
                        ];
                      }

                      return [
                        <GridActionsCellItem
                          key={id.toString()}
                          icon={<FaEdit />}
                          label="Edit"
                          className="textPrimary"
                          color="inherit"
                          onClick={handleEditClick(id)}
                        />,
                        <GridActionsCellItem
                          key={id.toString()}
                          icon={<FaFileImage />}
                          label="Edit Image"
                          className="textPrimary"
                          color="inherit"
                          onClick={handleImageClick(id)}
                        />,

                        <GridActionsCellItem
                          key={id.toString()}
                          icon={<FaTrashCan />}
                          label="Delete"
                          className="textPrimary"
                          color="inherit"
                          onClick={handleDeleteClick(id)}
                        />,
                      ];
                    },
                  },
                  {
                    field: "inActive",
                    headerName: "inActive",
                    type: "boolean",
                    width: 120,
                    editable: true,
                  },
                  {
                    field: "packageName",
                    headerName: "Nama Package",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "packageDesc",
                    headerName: "Description",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "costPoint",
                    headerName: "Cost Point",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                    type: "number",
                  },
                  {
                    field: "limit",
                    headerName: "Max Redeem",
                    minWidth: 250,
                    headerAlign: "center",
                    type: "number",
                    editable: true,
                  },
                  {
                    field: "photo",
                    headerName: "Image",
                    type: "actions",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                    align: "center",
                    getActions: ({ id }) => [
                      <PhotoProvider key={id} className="text-xs">
                        <PhotoView
                          src={`${baseUrl}/api/package-redeem/image/${id.toString()}`}
                        >
                          <GridActionsCellItem
                            icon={<MdPhoto />}
                            label="Tampilkan Gambar"
                            className="textPrimary"
                            color="inherit"
                          />
                        </PhotoView>
                      </PhotoProvider>,
                    ],
                  },
                  {
                    field: "createdBy",
                    headerName: "Created By",
                    headerAlign: "center",
                    minWidth: 250,
                    editable: false,
                  },
                  {
                    field: "createdAt",
                    headerName: "Created At",
                    headerAlign: "center",
                    minWidth: 250,
                    editable: false,
                    type: "dateTime",
                  },
                  {
                    field: "updatedBy",
                    headerName: "Updated By",
                    headerAlign: "center",
                    minWidth: 250,
                    editable: false,
                  },
                  {
                    field: "updatedAt",
                    headerName: "updated At",
                    headerAlign: "center",
                    minWidth: 250,
                    editable: false,
                    type: "dateTime",
                  },
                ]}
              />
            </div>
          </div>
        </Content>
      </Layout>

      <Modal
        title={"Edit Image"}
        footer={null}
        open={openImage}
        onCancel={() => setOpenImage(false)}
        destroyOnClose
      >
        <Dragger {...props}>
          <p className="text-2xl text-center flex items-center justify-center">
            <FaInbox />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single. Strictly prohibited from uploading company
            data or other banned files.
          </p>
        </Dragger>
      </Modal>
    </Layout>
  );
}
