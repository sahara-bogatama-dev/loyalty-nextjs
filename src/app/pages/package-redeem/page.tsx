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
import {
  addPackages,
  deletePackages,
  disablePackages,
  paginationPackage,
  searchPackages,
  updatePackage,
} from "@/controller/action";
import HeaderBar from "@/app/component/header.comp";
import {
  DataGrid,
  GridActionsCellItem,
  GridRowParams,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Pagination } from "@mui/material";
import _ from "lodash";
import moment from "moment";
import { MdAddPhotoAlternate } from "react-icons/md";
import { RcFile } from "antd/es/upload";
import getBase64 from "@/lib/arrayBufferToBase64";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { MdDisabledByDefault } from "react-icons/md";
import dayjs from "dayjs";

export default function Home() {
  const { Content } = Layout;
  const { RangePicker } = DatePicker;

  const [baseUrl, setBaseUrl] = React.useState("");

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingModal, setLoadingModal] = React.useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [packageList, setPackageList] = React.useState<any[]>([]);

  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isModalEditOpen, setIsModalEditOpen] = React.useState(false);

  const fetchListPackage = React.useCallback(
    async ({ take, skip }: { skip: number; take: number }) => {
      const packageRedeem = await paginationPackage({ take, skip });
      if (packageRedeem.success) {
        setPackageList(packageRedeem.value.result as any);
        setTotalPage(Math.ceil(packageRedeem.value.count / 100));
      } else {
        messageApi.open({
          type: "error",
          content: packageRedeem.error,
        });
      }
    },
    [messageApi]
  );

  React.useEffect(() => {
    fetchListPackage({
      skip: 0,
      take: 100,
    });

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

  const validateUploadEdit = (rule: any, value: any) => {
    if (!value || value.fileList.length === 0) {
      return Promise.resolve();
    }

    return validateFile(value.fileList[0].originFileObj)
      .then(() => Promise.resolve())
      .catch((error) => Promise.reject(error));
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
                        fetchListPackage({
                          skip: 0,
                          take: 100,
                        });
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

            <Form
              name="searchForm"
              layout="inline"
              onFinish={async (value) => {
                setLoading(true);
                const search = await searchPackages({
                  searchText: value.search,
                });

                if (search.success) {
                  setPackageList(search.value);
                  setTotalPage(0);
                  setCurrentPage(0);
                } else {
                  messageApi.open({
                    type: "error",
                    content: search.error,
                  });
                }
                setLoading(false);
              }}
              autoComplete="off"
              className="my-2"
            >
              <Form.Item
                label="Search"
                name="search"
                rules={[
                  {
                    required: true,
                    message: "Please input your search!",
                  },
                ]}
              >
                <Input placeholder="Package name" />
              </Form.Item>

              <Form.Item>
                <ConfigProvider theme={{ token: { colorPrimary: "red" } }}>
                  <Button
                    loading={loading}
                    type="primary"
                    htmlType="submit"
                    block
                  >
                    Search
                  </Button>
                </ConfigProvider>
              </Form.Item>

              <Form.Item>
                <ConfigProvider theme={{ token: { colorPrimary: "red" } }}>
                  <Button
                    loading={loading}
                    type="primary"
                    htmlType="button"
                    block
                    onClick={() => {
                      setTotalPage(0);
                      setCurrentPage(0);
                      fetchListPackage({ take: 100, skip: 0 });
                    }}
                  >
                    Reset
                  </Button>
                </ConfigProvider>
              </Form.Item>
            </Form>
            <div style={{ height: 500, width: "100%", marginTop: 10 }}>
              <DataGrid
                slots={{
                  toolbar: () => (
                    <div className="flex items-center m-2 gap-2">
                      <GridToolbarQuickFilter placeholder="Filter by data table" />
                    </div>
                  ),
                }}
                pagination={true}
                getRowHeight={() => "auto"}
                rowSelection={false}
                rows={packageList}
                getRowId={(row) => row.packageId}
                columns={[
                  {
                    field: "actions",
                    type: "actions",
                    getActions: (params: GridRowParams) => [
                      <GridActionsCellItem
                        key={params.id.toString()}
                        onClick={() => {
                          setLoadingModal(true);
                          setIsModalEditOpen(true);

                          editForm.setFieldsValue({
                            packageName: params.row.packageName,
                            point: params.row.costPoint,
                            limit: params.row.limit,
                            desc: params.row.packageDesc,
                            packageId: params.id.toString(),
                          });
                          setLoadingModal(false);
                        }}
                        label="Edit"
                        icon={<FaEdit />}
                        showInMenu
                      />,
                      <GridActionsCellItem
                        key={params.id.toString()}
                        icon={<MdDisabledByDefault />}
                        onClick={async () => {
                          const disables = await disablePackages({
                            updatedBy: session?.user?.name ?? undefined,
                            packageId: params.id.toString(),
                            disable: !params.row.inActive,
                          });

                          if (disables.success) {
                            fetchListPackage({
                              skip: Math.max(0, (currentPage - 1) * 100),
                              take: 100,
                            });
                          } else {
                            messageApi.open({
                              type: "error",
                              content: disables.error,
                            });
                          }
                        }}
                        label={`${params.row.inActive ? "Enable" : "Disable"}`}
                        showInMenu
                      />,
                      <GridActionsCellItem
                        key={params.id.toString()}
                        icon={<FaTrash />}
                        onClick={async () => {
                          const deletes = await deletePackages({
                            packageId: params.id.toString(),
                          });

                          if (deletes.success) {
                            fetchListPackage({
                              skip: Math.max(0, (currentPage - 1) * 100),
                              take: 100,
                            });
                          } else {
                            messageApi.open({
                              type: "error",
                              content: deletes.error,
                            });
                          }
                        }}
                        label="Delete"
                        showInMenu
                      />,
                    ],
                  },
                  {
                    field: "inActive",
                    headerName: "disable",
                    type: "boolean",
                    width: 120,
                  },
                  {
                    field: "packageName",
                    headerName: "Nama Package",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "packageDesc",
                    headerName: "Description",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "costPoint",
                    headerName: "Cost Point",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "limit",
                    headerName: "Max Redeem",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "photo",
                    headerName: "Image",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                    align: "center",
                    renderCell: (params) => {
                      return (
                        <PhotoProvider>
                          <PhotoView
                            src={`${baseUrl}/api/package-redeem/image/${params.id.toString()}`}
                          >
                            <Button onClick={() => {}} type="link">
                              Tampilkan Gambar
                            </Button>
                          </PhotoView>
                        </PhotoProvider>
                      );
                    },
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
                    valueFormatter: (params) =>
                      moment(params).format("DD/MM/YYYY"),
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
                    valueFormatter: (params) =>
                      moment(params).format("DD/MM/YYYY"),
                  },
                ]}
              />
            </div>

            <div className="flex justify-center py-4">
              <Pagination
                count={totalPage}
                page={currentPage}
                onChange={async (
                  event: React.ChangeEvent<unknown>,
                  value: number
                ) => {
                  setCurrentPage(value);
                  fetchListPackage({
                    skip: Math.max(0, (value - 1) * 100),
                    take: 100,
                  });
                }}
                shape="rounded"
              />
            </div>
          </div>
        </Content>
      </Layout>

      <Modal
        title="Edit Package"
        open={isModalEditOpen}
        onCancel={() => {
          setIsModalEditOpen(false);
        }}
        footer={null}
        destroyOnClose={true}
        width={1000}
        loading={loadingModal}
      >
        <Form
          name="editPackage"
          className="gap-10"
          form={editForm}
          onFinish={async (value) => {
            try {
              const base64 = value.addImg
                ? value.addImg?.file?.status === "removed"
                  ? undefined
                  : ((await getBase64(value.addImg.file)) as string)
                : undefined;

              setLoading(true);

              const updatePackages = await updatePackage({
                packageId: value.packageId,
                packageName: value.packageName,
                costPoint: value.point,
                limit: value.limit,
                description: value.desc,
                createdBy: session?.user?.name ?? "",
                image: base64?.replace(/^data:image\/[a-z]+;base64,/, ""),
              });

              if (updatePackages.success) {
                messageApi.open({
                  type: "success",
                  content: "Package redeem sudah diperbarui.",
                });

                editForm.resetFields();
                fetchListPackage({
                  skip: 0,
                  take: 100,
                });
              } else {
                messageApi.open({
                  type: "error",
                  content: updatePackages.error,
                });
              }
              setLoading(false);
              setIsModalEditOpen(false);
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
            <Form.Item name="packageId" hidden>
              <Input />
            </Form.Item>
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
                    validator: validateUploadEdit,
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
              <Button loading={loading} type="primary" htmlType="submit" block>
                Edit Package
              </Button>
            </ConfigProvider>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
