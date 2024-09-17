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
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import {
  addCampaigns,
  listProducts,
  paginationCampaign,
  paginationProduct,
  searchProducts,
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
import Img from "next/image";

export default function Home() {
  const { Content } = Layout;
  const { RangePicker } = DatePicker;

  const [baseUrl, setBaseUrl] = React.useState("");

  const [addForm] = Form.useForm();

  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [campaignList, setCampaignList] = React.useState<any[]>([]);
  const [productList, setProductList] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

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
    const maxSize = 500 * 1024; // 500KB in bytes
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
          img.src = e.target.result as string; // Ensure result is a string
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
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Campaign</Breadcrumb.Item>
          </Breadcrumb>
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
                        startDate: moment(value.dateRange[0]).toISOString(),
                        endDate: moment(value.dateRange[1]).toISOString(),
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
                          fetchProduct();
                          addForm.resetFields();
                          fetchCampaign({
                            skip: 0,
                            take: 100,
                          });

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
                        <RangePicker format={"DD/MM/YYYY"} />
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
                searchProducts({ searchText: value.search })
                  .then((value) => {
                    setProductList(value);
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
                        onClick={() => {}}
                        label="Edit"
                        showInMenu
                      />,
                      <GridActionsCellItem
                        key={params.id.toString()}
                        onClick={() => {}}
                        label={`${params.row.inActive ? "Enable" : "Disable"}`}
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
                    headerName: "Nama Campaign",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                    type: "dateTime",
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY hh:mm"),
                  },
                  {
                    field: "endDate",
                    headerName: "Nama Campaign",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                    type: "dateTime",
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY hh:mm"),
                  },
                  {
                    field: "loyaltyPoint",
                    headerName: "Point",
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
                    renderCell: (params) => {
                      return (
                        <Img
                          src={`${baseUrl}/api/campaign/image/${params.id.toString()}`}
                          alt="avatar"
                          width={50}
                          height={50}
                          unoptimized
                        />
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
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY hh:mm"),
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
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY hh:mm"),
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
    </Layout>
  );
}
