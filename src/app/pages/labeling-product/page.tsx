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
  DatePicker,
  Select,
  InputNumber,
  Tag,
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
} from "@mui/x-data-grid-premium";
import {
  createLabelingProduct,
  listDataGetProduct,
  listDataLabelingProduct,
  printLabelingProduct,
} from "@/controller/labelingProduct/action";
import { Box } from "@mui/material";
import dayjs from "dayjs";

export default function Home() {
  const apiRef = useGridApiRef();
  const { Content } = Layout;
  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingTable, setLoadingTable] = React.useState(false);

  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [labelingProductList, setLabelingProductList] = React.useState<any[]>(
    []
  );

  const [listProduct, setListProduct] = React.useState<
    { id: string; productName: string }[]
  >([]);

  const [addForm] = Form.useForm();

  const fetchLabelingProduct = React.useCallback(async () => {
    setLoadingTable(true);
    const listData = await listDataLabelingProduct();

    if (listData.success) {
      setLabelingProductList(listData.value);
    } else {
      messageApi.open({
        type: "error",
        content: listData.error,
      });
    }
    setLoadingTable(false);
  }, [messageApi]);

  const fetchListProduct = React.useCallback(async () => {
    setLoadingTable(true);
    const listData = await listDataGetProduct();

    if (listData.success) {
      setListProduct(listData.value);
    } else {
      messageApi.open({
        type: "error",
        content: listData.error,
      });
    }
    setLoadingTable(false);
  }, [messageApi]);

  React.useEffect(() => {
    fetchLabelingProduct();
    fetchListProduct();
  }, [fetchLabelingProduct, fetchListProduct]);

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
              {
                title: "List Labeling Product",
                href: "/pages/labeling-product",
              },
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
              <Card size="small" title="Buat Labeling Product" bordered={true}>
                <Form
                  name="createProduct"
                  className="gap-10"
                  form={addForm}
                  onFinish={async (value) => {
                    try {
                      setLoading(true);
                      setLoadingTable(true);

                      const addLabeling = await createLabelingProduct({
                        productId: value.selectProduct,
                        qty: value.qtygenerate,
                        shift: value.shift,
                        batch: value.batch,
                        createdBy: session?.user?.name ?? "",
                      });

                      if (addLabeling.success) {
                        fetchLabelingProduct();
                        messageApi.success(
                          "Berhasil generate labeling product."
                        );
                      } else {
                        messageApi.open({
                          type: "error",
                          content: addLabeling.error,
                        });
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
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
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
                          allowClear
                          options={_.map(listProduct, (o) => ({
                            value: o.id,
                            label: <span>{o.productName}</span>,
                          }))}
                          virtual={false}
                        />
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="shift"
                        name="shift"
                        rules={[
                          {
                            required: true,
                            message: "Please input your shift!",
                          },
                        ]}
                      >
                        <InputNumber className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="batch"
                        name="batch"
                        rules={[
                          {
                            required: true,
                            message: "Please input your Batch!",
                          },
                        ]}
                      >
                        <InputNumber className="w-full" />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Qty"
                        name="qtygenerate"
                        rules={[
                          {
                            required: true,
                            message: "Please input your Qty Generate!",
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
                        Generate
                      </Button>
                    </ConfigProvider>
                  </Form.Item>
                </Form>
              </Card>
            </div>

            <div style={{ height: 500, width: "100%", marginTop: 10 }}>
              <DataGridPremium
                apiRef={apiRef}
                loading={loadingTable}
                pageSizeOptions={[10, 100, 1000]}
                rows={labelingProductList}
                disableRowSelectionOnClick
                headerFilters
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 100, page: 0 },
                  },
                  filter: {
                    filterModel: {
                      items: [
                        {
                          field: "status",
                          operator: "equals",
                          value: "Unprinted",
                        },
                      ],
                    },
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
                      <Button
                        onClick={async () => {
                          if (_.isEmpty(rowSelectionModel)) {
                            messageApi.error("Pilih product terlebih dahulu.");
                          } else {
                            setLoading(true);
                            const printered = await printLabelingProduct({
                              labelingProductId: rowSelectionModel as any,
                              updatedBy: session?.user?.name ?? "",
                            });

                            if (printered.success) {
                              setLabelingProductList((prevRows) =>
                                prevRows.map((row) =>
                                  rowSelectionModel.includes(
                                    row.labelingProductId
                                  )
                                    ? {
                                        ...row,
                                        statusColor: "green",
                                        status: "Printed",
                                        updatedAt: dayjs().toDate(),
                                        updatedBy: session?.user?.name ?? "",
                                      }
                                    : row
                                )
                              );

                              const selectedRowIds = Array.from(
                                apiRef.current.getSelectedRows().keys()
                              );

                              if (selectedRowIds.length > 0) {
                                apiRef.current.exportDataAsExcel({
                                  fileName: `PrintedLabelProducts[${dayjs().format(
                                    "DD-MM-YYYY HH:mm"
                                  )}]-${session?.user?.name}`,
                                  getRowsToExport: () => selectedRowIds,
                                });
                              } else {
                                message.error("No rows selected.");
                              }
                            } else {
                              messageApi.error(printered.error);
                            }
                            setLoading(false);
                          }
                        }}
                        loading={loading}
                      >
                        Printed
                      </Button>
                    </GridToolbarContainer>
                  ),
                }}
                checkboxSelection
                onRowSelectionModelChange={(newSelection) => {
                  setRowSelectionModel(newSelection);
                }}
                rowSelection
                pagination
                disableColumnResize={false}
                getRowId={(row) => row.labelingProductId}
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
                    field: "codeLabel",
                    headerName: "Labeling product",
                    width: 250,
                    editable: true,
                  },
                  {
                    field: "productName",
                    headerName: "Nama Product",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "productCode",
                    headerName: "Kode Product",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "shift",
                    headerName: "Shift",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "batch",
                    headerName: "Batch",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
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
