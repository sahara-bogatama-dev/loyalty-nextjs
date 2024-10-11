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
  Col,
  Tag,
  Select,
  Row,
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import HeaderBar from "@/app/component/header.comp";
import _ from "lodash";
import {
  DataGridPremium,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  GridRowSelectionModel,
  useGridApiRef,
  GridToolbarExport,
} from "@mui/x-data-grid-premium";
import {
  addLocationStocks,
  listDataStock,
  listDataUnlocation,
} from "@/controller/stock/action";
import dayjs from "dayjs";

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

  const [unlocationList, setUnlocationList] = React.useState<
    { value: string; label: string }[]
  >([]);
  const [stockList, setStockList] = React.useState<any[]>([]);

  const [addForm] = Form.useForm();

  const fetchUnlocation = React.useCallback(async () => {
    setLoadingTable(true);
    const data = await listDataUnlocation();

    if (data.success) {
      setUnlocationList(data.value as any);
    } else {
      messageApi.error(data.error);
    }
    setLoadingTable(false);
  }, [messageApi]);

  const fetchLabelingBox = React.useCallback(async () => {
    setLoadingTable(true);
    const data = await listDataStock();
    if (data.success) {
      setStockList(data.value);
    } else {
      messageApi.error(data.error);
    }
    setLoadingTable(false);
  }, [messageApi]);

  React.useEffect(() => {
    fetchUnlocation();
    fetchLabelingBox();
  }, [fetchLabelingBox, fetchUnlocation]);

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
              { title: "List Stockopname", href: "/pages/stock" },
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
            <div className="flex justify-center gap-10">
              <Card size="small" title="Add Location" bordered={true}>
                <Form
                  name="addLocation"
                  className="gap-10"
                  form={addForm}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  onFinish={async (value) => {
                    try {
                      setLoading(true);
                      setLoadingTable(true);
                      const addLocation = await addLocationStocks({
                        updatedBy: session?.user?.name ?? "",
                        location: value.location,
                        labelingBox: value.stock,
                      });

                      if (addLocation.success) {
                        messageApi.success("Berhasil menambahkan lokasi.");
                        setUnlocationList((prev) =>
                          prev.filter((o) => o.value != value.stock)
                        );

                        setStockList((prevRows) =>
                          prevRows.map((row) =>
                            row.labelingBox === value.stock
                              ? {
                                  ...row,
                                  location: value.location,
                                  statusColor: "gold",
                                  status: "In-Stock",
                                  updatedAt: dayjs().toDate(),
                                  updatedBy: session?.user?.name ?? "",
                                }
                              : row
                          )
                        );
                      } else {
                        messageApi.error(addLocation.error);
                      }

                      setLoading(false);
                      setLoadingTable(false);
                    } catch (e: any) {
                      messageApi.open({
                        type: "error",
                        content: e.message,
                      });
                    }
                  }}
                  autoComplete="off"
                >
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col className="gutter-row">
                      <Form.Item
                        label="Location"
                        name="location"
                        rules={[
                          {
                            required: true,
                            message: "Please input your Location!",
                          },
                          {
                            max: 5,
                            message: "max length 5.",
                          },
                        ]}
                      >
                        <Input className="w-full" />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row">
                      <Form.Item
                        label="Select Item"
                        name="stock"
                        rules={[
                          {
                            required: true,
                            message: "Please select an Item!",
                          },
                        ]}
                      >
                        <Select
                          allowClear
                          options={_.map(unlocationList, (o) => ({
                            value: o.value,
                            label: <span>{o.label}</span>,
                          }))}
                          virtual={false}
                          className="w-full"
                        />
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
                        Tambahkan Lokasi
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
                rows={stockList}
                disableRowSelectionOnClick
                headerFilters
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 1000, page: 0 },
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
                      <GridToolbarExport />
                    </GridToolbarContainer>
                  ),
                }}
                pagination
                disableColumnResize={false}
                getRowId={(row) => row.stokopnameId}
                columns={[
                  {
                    field: "status",
                    headerName: "Status",
                    width: 250,
                    editable: true,
                    headerAlign: "center",
                    align: "center",
                    renderCell(params) {
                      return (
                        <Tag
                          key={1}
                          color={params.row.statusColor}
                          className="my-1"
                        >
                          {params.row.status}
                        </Tag>
                      );
                    },
                  },
                  {
                    field: "productName",
                    headerName: "Product Name",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "productCode",
                    headerName: "Product Code",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "weight",
                    headerName: "weight",
                    width: 250,
                    type: "string",
                    editable: false,
                  },
                  {
                    field: "unit",
                    headerName: "Unit",
                    width: 250,
                    type: "string",
                    editable: false,
                  },
                  {
                    field: "expiredDate",
                    headerName: "Expired Date",
                    width: 250,
                    type: "date",
                    editable: false,
                  },
                  {
                    field: "labelingProduct",
                    headerName: "Labeling Product",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "labelingBox",
                    headerName: "Labeling Box",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "location",
                    headerName: "Location",
                    width: 250,
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
