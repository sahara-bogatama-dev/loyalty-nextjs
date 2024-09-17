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
  UploadProps,
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import {
  addProducts,
  downloadProducts,
  listUnits,
  paginationProduct,
  searchProducts,
  uploadProduct,
} from "@/controller/action";
import HeaderBar from "@/app/component/header.comp";
import { DataGrid, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Pagination } from "@mui/material";
import _ from "lodash";
import moment from "moment";
import * as XLSX from "xlsx";
import { UploadOutlined } from "@ant-design/icons";

export default function Home() {
  const { Content } = Layout;
  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [productList, setProductList] = React.useState<any[]>([]);
  const [unit, setUnit] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const fetchProduct = async ({
    take,
    skip,
  }: {
    skip: number;
    take: number;
  }) => {
    const product = await paginationProduct({ take, skip });
    setProductList(product.result as any);
    setTotalPage(Math.ceil(product.count / 100));
  };

  const fetchUnit = async () => {
    const units = await listUnits();
    setUnit(units);
  };

  React.useEffect(() => {
    fetchUnit();
    fetchProduct({
      skip: 0,
      take: 100,
    });
  }, []);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        productName: "Daging Burger Sapi1",
        weight: Number("2.5"),
        unit: "Pack",
        productCode: "SB1",
        expiredPeriod: 100,
        basePoint: 100,
      },
    ] as any);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(
      wb,
      `Template Sahara Product ${moment().format("DD-MM-YYYY")}-${
        Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
      }.xlsx`
    );
  };

  const exportProduct = async () => {
    const allProduct = await downloadProducts();
    const ws = XLSX.utils.json_to_sheet(allProduct);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(
      wb,
      `Sahara Product ${moment().format("DD-MM-YYYY")}-${
        Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
      }.xlsx`
    );
  };

  const handleFileChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "done") {
      // File has been uploaded successfully
      const file = info.file.originFileObj;
      if (file) {
        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          // Assuming you want to read the first sheet
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet);

          uploadProduct({
            data: _.map(json, (o: any) => ({
              ...o,
              expiredPeriod: moment().add(o.expiredPeriod, "days").toDate(),
            })),
          })
            .then(() => {
              fetchProduct({
                skip: Math.max(0, (currentPage - 1) * 100),
                take: 100,
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
        };

        reader.readAsArrayBuffer(file);
      }
    } else if (info.file.status === "error") {
      messageApi.open({
        type: "error",
        content: `${info.file.name} file upload failed.`,
      });
    }
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
            <Breadcrumb.Item>Product</Breadcrumb.Item>
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
              <Card size="small" title="Tambah Product" bordered={true}>
                <Form
                  name="addProduct"
                  className="gap-10"
                  initialValues={{}}
                  onFinish={(value) => {
                    try {
                      setLoading(true);
                      addProducts({
                        productCode: value.productCode,
                        productName: value.productName,
                        weight: value.weight,
                        basePoint: value.basePoint,
                        unit: value.pack,
                        expiredPeriod: value.expPeriod,
                        createdBy: session?.user?.name ?? "",
                      })
                        .then((value) => {
                          fetchProduct({
                            skip: Math.max(0, (currentPage - 1) * 100),
                            take: 100,
                          });
                          messageApi.open({
                            type: "success",
                            content: "Product sudah di tambahkan.",
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
                        label="Product Name"
                        name="productName"
                        rules={[
                          {
                            required: true,
                            message: "Please input your product name!",
                          },
                          {
                            max: 255,
                            message: "Max length Product name!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Product Code"
                        name="productCode"
                        rules={[
                          {
                            required: true,
                            message: "Please input your product code!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Weight"
                        name="weight"
                        rules={[
                          {
                            required: true,
                            message: "Please input your weight!",
                          },
                        ]}
                      >
                        <InputNumber addonAfter="KG" className="w-full" />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Pack"
                        name="pack"
                        rules={[
                          {
                            required: true,
                            message: "Please input your pack!",
                          },
                        ]}
                      >
                        <Select
                          options={_.map(unit, (o) => ({
                            value: o.value,
                            label: <span>{o.label}</span>,
                          }))}
                        />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Expired Period"
                        name="expPeriod"
                        rules={[
                          {
                            required: true,
                            message: "Please input your expired period!",
                          },
                        ]}
                      >
                        <InputNumber addonAfter="Hari" className="w-full" />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Base Point"
                        name="basePoint"
                        rules={[
                          {
                            required: true,
                            message: "Please input your base point!",
                          },
                        ]}
                      >
                        <InputNumber className="w-full" />
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
                        Add Product
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
                <Input placeholder="fullname atau email" />
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
                      fetchProduct({
                        skip: 0,
                        take: 100,
                      });
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

                      <Upload
                        disabled={loading}
                        accept=".xlsx"
                        showUploadList={false}
                        onChange={handleFileChange}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          loading={loading}
                          type="link"
                        >
                          Upload
                        </Button>
                      </Upload>
                      <Button
                        type="link"
                        onClick={() => {
                          downloadTemplate();
                        }}
                      >
                        Template
                      </Button>
                      <Button
                        type="link"
                        onClick={() => {
                          exportProduct();
                        }}
                      >
                        Export
                      </Button>
                    </div>
                  ),
                }}
                pagination={true}
                getRowHeight={() => "auto"}
                rowSelection={false}
                rows={productList}
                getRowId={(row) => row.productId}
                columns={[
                  {
                    field: "basePoint",
                    headerName: "Base Point",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "productCode",
                    headerName: "Product Code",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "productName",
                    headerName: "Product Name",
                    minWidth: 250,
                    align: "left",
                    editable: false,
                  },
                  {
                    field: "weight",
                    headerName: "Weight (Kg)",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "unit",
                    headerName: "Unit",
                    minWidth: 250,

                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "expiredPeriod",
                    headerName: "Expired Period",
                    minWidth: 250,
                    type: "dateTime",
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY"),
                    headerAlign: "center",
                    editable: false,
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
                  fetchProduct({
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
