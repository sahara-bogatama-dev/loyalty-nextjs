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
  Select,
  Upload,
  DatePicker,
  Modal,
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import {
  addCampaigns,
  currentProducts,
  deleteCampaigns,
  disableCampaigns,
  listProducts,
  paginationCampaign,
  searchCampaigns,
  updateCampaigns,
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
  const [campaignList, setCampaignList] = React.useState<any[]>([]);
  const [productList, setProductList] = React.useState<any[]>([]);
  const [productCombList, setProductCombList] = React.useState<any[]>([]);
  const [productOldList, setProductOldList] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isModalEditOpen, setIsModalEditOpen] = React.useState(false);

  const fetchCampaign = async ({
    take,
    skip,
  }: {
    skip: number;
    take: number;
  }) => {
    const campaign = await paginationCampaign({ take, skip });
    setCampaignList(campaign.result as any);
    setTotalPage(Math.ceil(campaign.count / 100));
  };

  const fetchProduct = async () => {
    const units = await listProducts();
    setProductList(units);
  };

  React.useEffect(() => {
    fetchCampaign({
      skip: 0,
      take: 100,
    });
    fetchProduct();

    const { protocol, hostname, port } = window.location;
    setBaseUrl(`${protocol}//${hostname}${port ? `:${port}` : ""}`);
  }, []);

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
              { title: "Campaign", href: "/pages/campaign" },
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
                  name="addCampaign"
                  className="gap-10"
                  form={addForm}
                  onFinish={async (value) => {
                    try {
                      const base64 = (await getBase64(
                        value.addImg.file
                      )) as string;

                      setLoading(true);
                      addCampaigns({
                        campaignName: value.campaignName,
                        startDate: dayjs(value.dateRange[0]).toISOString(),
                        endDate: dayjs(value.dateRange[1]).toISOString(),
                        productId: value.selectProduct,
                        description: value.desc,
                        loyaltyPoint: value.point,
                        createdBy: session?.user?.name ?? "",
                        image: base64.replace(
                          /^data:image\/[a-z]+;base64,/,
                          ""
                        ),
                      })
                        .then(() => {
                          messageApi.open({
                            type: "success",
                            content: "Campaign sudah ditambahkan.",
                          });
                        })
                        .catch((e) => {
                          messageApi.open({
                            type: "error",
                            content: e.message,
                          });
                        })
                        .finally(() => {
                          setLoading(false);
                          fetchProduct();
                          addForm.resetFields();
                          fetchCampaign({
                            skip: 0,
                            take: 100,
                          });
                        });
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
                        label="Campaign Name"
                        name="campaignName"
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
                        label="Range Date"
                        name="dateRange"
                        rules={[
                          {
                            required: true,
                            message: "Please input your start date!",
                          },
                        ]}
                      >
                        <RangePicker format={"DD/MM/YYYY"} className="w-full" />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Select Product"
                        name="selectProduct"
                        rules={[
                          {
                            required: true,
                            message: "Please input your product!",
                          },
                        ]}
                      >
                        <Select
                          mode="multiple"
                          allowClear
                          options={_.map(productList, (o) => ({
                            value: o.value,
                            label: <span>{o.label}</span>,
                          }))}
                        />
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
                            message: "Please input your base point!",
                          },
                        ]}
                      >
                        <Input />
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
                        Add Campaign
                      </Button>
                    </ConfigProvider>
                  </Form.Item>
                </Form>
              </Card>
            </div>

            <Form
              name="searchForm"
              layout="inline"
              onFinish={(value) => {
                setLoading(true);
                searchCampaigns({ searchText: value.search })
                  .then((value) => {
                    setCampaignList(value);
                    setTotalPage(0);
                    setCurrentPage(0);
                  })
                  .catch((e) => {
                    messageApi.open({
                      type: "error",
                      content: e.message,
                    });
                  })
                  .finally(() => {
                    setLoading(false);
                  });
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
                <Input placeholder="Campaign name" />
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
                      fetchCampaign({ take: 100, skip: 0 });
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
                rows={campaignList}
                getRowId={(row) => row.campaignId}
                columnGroupingModel={[
                  {
                    groupId: "durationCampaign",
                    headerName: "Campaign Duration",
                    headerAlign: "center",
                    children: [{ field: "startDate" }, { field: "endDate" }],
                  },
                ]}
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

                          fetchProduct().finally(() => {
                            currentProducts({
                              campaignId: params.id.toString(),
                            })
                              .then((value: any) => {
                                setProductOldList(value);
                                editForm.setFieldsValue({
                                  selectProduct: value,
                                });
                                setProductCombList(
                                  _.concat(productList, value)
                                );
                              })
                              .catch((e) => {
                                messageApi.open({
                                  type: "error",
                                  content: e.message,
                                });
                              })
                              .finally(() => {
                                setLoadingModal(false);
                              });
                          });
                          editForm.setFieldsValue({
                            campaignName: params.row.campaignName,
                            point: params.row.loyaltyPoint,
                            dateRange: [
                              dayjs(params.row.startDate),
                              dayjs(params.row.endDate),
                            ],
                            desc: params.row.description,
                            campaignId: params.id.toString(),
                          });
                        }}
                        label="Edit"
                        icon={<FaEdit />}
                        showInMenu
                      />,
                      <GridActionsCellItem
                        key={params.id.toString()}
                        icon={<MdDisabledByDefault />}
                        onClick={() => {
                          disableCampaigns({
                            updatedBy: session?.user?.name ?? undefined,
                            idEdit: params.id.toString(),
                            disable: !params.row.inActive,
                          })
                            .then(() => {
                              fetchCampaign({
                                skip: Math.max(0, (currentPage - 1) * 100),
                                take: 100,
                              });
                            })
                            .catch((e) => {
                              messageApi.open({
                                type: "error",
                                content: e.message,
                              });
                            });
                        }}
                        label={`${params.row.inActive ? "Enable" : "Disable"}`}
                        showInMenu
                      />,
                      <GridActionsCellItem
                        key={params.id.toString()}
                        icon={<FaTrash />}
                        onClick={() => {
                          deleteCampaigns({
                            idEdit: params.id.toString(),
                          })
                            .then(() => {
                              fetchCampaign({
                                skip: Math.max(0, (currentPage - 1) * 100),
                                take: 100,
                              });
                              fetchProduct();
                            })
                            .catch((e) => {
                              messageApi.open({
                                type: "error",
                                content: e.message,
                              });
                            });
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
                    field: "campaignName",
                    headerName: "Nama Campaign",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "startDate",
                    headerName: "Start Date",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                    type: "dateTime",
                    valueFormatter: (params) =>
                      moment(params).format("DD/MM/YYYY"),
                  },
                  {
                    field: "endDate",
                    headerName: "End Date",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                    type: "dateTime",
                    valueFormatter: (params) =>
                      moment(params).format("DD/MM/YYYY"),
                  },
                  {
                    field: "loyaltyPoint",
                    headerName: "Point",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "description",
                    headerName: "Description",
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
                            src={`${baseUrl}/api/campaign/image/${params.id.toString()}`}
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
                  fetchCampaign({
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
        title="Edit Campaign"
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
          name="editdCampaign"
          className="gap-10"
          form={editForm}
          onFinish={async (value) => {
            try {
              setLoading(true);
              const base64 = value.addImg
                ? value.addImg?.file?.status === "removed"
                  ? undefined
                  : ((await getBase64(value.addImg.file)) as string)
                : undefined;

              updateCampaigns({
                campaignId: value.campaignId,
                campaignName: value.campaignName,
                startDate: dayjs(value.dateRange[0]).toISOString(),
                endDate: dayjs(value.dateRange[1]).toISOString(),
                productId: value.selectProduct,
                oldProductId: _.difference(
                  _.map(productOldList, (o) => {
                    return o.value;
                  }),
                  value.selectProduct
                ),
                description: value.desc,
                loyaltyPoint: value.point,
                updatedBy: session?.user?.name ?? "",
                image: base64?.replace(/^data:image\/[a-z]+;base64,/, ""),
              })
                .then(() => {
                  fetchCampaign({
                    skip: Math.max(0, (currentPage - 1) * 100),
                    take: 100,
                  });
                  fetchProduct();
                })
                .catch((e) => {
                  messageApi.open({
                    type: "error",
                    content: e.message,
                  });
                })
                .finally(() => {
                  setLoading(false);
                  setIsModalEditOpen(false);
                  messageApi.open({
                    type: "success",
                    content: "Berhasil di update.",
                  });
                });
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
            <Form.Item name="campaignId" hidden>
              <Input />
            </Form.Item>
            <Col className="gutter-row" xs={24} md={12} xl={8}>
              <Form.Item
                label="Campaign Name"
                name="campaignName"
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
                label="Range Date"
                name="dateRange"
                rules={[
                  {
                    required: true,
                    message: "Please input your start date!",
                  },
                ]}
              >
                <RangePicker format={"DD/MM/YYYY"} className="w-full" />
              </Form.Item>
            </Col>

            <Col className="gutter-row" xs={24} md={12} xl={8}>
              <Form.Item
                label="Select Product"
                name="selectProduct"
                rules={[
                  {
                    required: true,
                    message: "Please input your product!",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  options={_.map(productCombList, (o) => ({
                    value: o.value,
                    label: <span>{o.label}</span>,
                  }))}
                />
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
                    message: "Please input your base point!",
                  },
                ]}
              >
                <Input />
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
                Update Campaign
              </Button>
            </ConfigProvider>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
