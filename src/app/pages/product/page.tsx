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
  allProductData,
  listUnits,
  uploadProduct,
} from "@/controller/product/action";
import HeaderBar from "@/app/component/header.comp";
import {
  DataGridPremium,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import { Box, Pagination } from "@mui/material";
import _ from "lodash";
import moment from "moment";
import * as XLSX from "xlsx";
import { UploadOutlined } from "@ant-design/icons";

export default function Home() {
  const { Content } = Layout;
  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingTable, setLoadingTable] = React.useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [productList, setProductList] = React.useState<any[]>([]);
  const [unit, setUnit] = React.useState<any[]>([]);

  const fetchAllProduct = React.useCallback(async () => {
    setLoadingTable(true);
    const product = await allProductData();

    if (product.success) {
      setProductList(product.value.serializedProducts as any);
    } else {
      messageApi.open({
        type: "error",
        content: product.error,
      });
    }
    setLoadingTable(false);
  }, [messageApi]);

  const fetchUnit = React.useCallback(async () => {
    const units = await listUnits();

    if (units.success) {
      setUnit(units.value);
    } else {
      messageApi.open({
        type: "error",
        content: units.error,
      });
    }
  }, [messageApi]);

  React.useEffect(() => {
    fetchUnit();

    fetchAllProduct();
  }, [fetchAllProduct, fetchUnit]);

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

  const handleFileChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "done") {
      const file = info.file.originFileObj;
      if (file) {
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet);

          const uploadProd = await uploadProduct({
            data: _.map(json, (o: any) => ({
              ...o,
              expiredPeriod: moment().add(o.expiredPeriod, "days").toDate(),
              createdBy: session?.user?.name,
            })),
          });

          if (uploadProd.success) {
            fetchAllProduct();
          } else {
            messageApi.open({
              type: "error",
              content: uploadProd.error,
            });
          }

          setLoading(false);
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
          <Breadcrumb
            items={[
              { title: "Main", href: "/" },
              { title: "Product", href: "/pages/product" },
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
              <Card size="small" title="Tambah Product" bordered={true}>
                <Form
                  name="addProduct"
                  className="gap-10"
                  initialValues={{}}
                  onFinish={async (value) => {
                    try {
                      setLoading(true);

                      const addProd = await addProducts({
                        productCode: value.productCode,
                        productName: value.productName,
                        weight: value.weight,
                        basePoint: value.basePoint,
                        unit: value.pack,
                        expiredPeriod: value.expPeriod,
                        createdBy: session?.user?.name ?? "",
                      });

                      if (addProd.success) {
                        fetchAllProduct();
                        messageApi.open({
                          type: "success",
                          content: "Product sudah di tambahkan.",
                        });
                      } else {
                        messageApi.open({
                          type: "error",
                          content: addProd.success,
                        });
                      }
                      setLoading(false);
                      fetchAllProduct();
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
                          virtual={false}
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

            <div style={{ height: 500, width: "100%", marginTop: 10 }}>
              <DataGridPremium
                loading={loadingTable}
                pageSizeOptions={[10, 100, 1000]}
                rows={productList}
                getRowId={(row) => row.productId}
                disableRowSelectionOnClick
                headerFilters
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 100, page: 0 },
                  },
                }}
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
                      <Upload
                        accept=".xlsx"
                        showUploadList={false}
                        onChange={handleFileChange}
                        maxCount={1}
                        multiple={false}
                      >
                        <Button icon={<UploadOutlined />} loading={loading}>
                          Upload
                        </Button>
                      </Upload>
                      <Button
                        onClick={() => {
                          downloadTemplate();
                        }}
                        loading={loading}
                      >
                        Template
                      </Button>
                    </GridToolbarContainer>
                  ),
                }}
                pagination
                disableColumnResize={false}
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
                    headerAlign: "center",
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
                      moment(params).format("DD/MM/YYYY"),
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
    </Layout>
  );
}
