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
  Checkbox,
  List,
} from "antd";
import type { CheckboxProps } from "antd";
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
import { Box } from "@mui/material";
import dayjs from "dayjs";
import {
  scanDataLabelingProduct,
  listDataLabelingProduct,
  addLabelingBoxs,
  listDataLabelingBox,
  printLabelingBox,
} from "@/controller/labelinBox/action";

export default function Home() {
  const apiRef = useGridApiRef();
  const { Content } = Layout;
  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingTable, setLoadingTable] = React.useState(false);
  const [checkedScan, setCheckedScan] = React.useState(false);

  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);
  const [rowSelectionBoxModel, setRowSelectionBoxModel] =
    React.useState<GridRowSelectionModel>([]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [labelingProductList, setLabelingProductList] = React.useState<any[]>(
    []
  );
  const [labelingBoxList, setLabelingBoxList] = React.useState<any[]>([]);

  const [addForm] = Form.useForm();

  const fetchLabelingProduct = React.useCallback(async () => {
    setLoadingTable(true);
    const data = await listDataLabelingProduct();

    if (data.success) {
      setLabelingProductList(data.value);
    } else {
      messageApi.error(data.error);
    }
    setLoadingTable(false);
  }, [messageApi]);

  const fetchLabelingBox = React.useCallback(async () => {
    setLoadingTable(true);
    const data = await listDataLabelingBox();
    if (data.success) {
      setLabelingBoxList(data.value);
    } else {
      messageApi.error(data.error);
    }
    setLoadingTable(false);
  }, [messageApi]);

  React.useEffect(() => {
    fetchLabelingProduct();
    fetchLabelingBox();
  }, [fetchLabelingBox, fetchLabelingProduct]);

  const onChange: CheckboxProps["onChange"] = (e) => {
    setCheckedScan(e.target.checked);

    if (!e.target.checked) {
      fetchLabelingProduct();
      setLabelingProductList([]);
      setRowSelectionModel([]);
    } else {
      setLabelingProductList([]);
      setRowSelectionModel([]);
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
              { title: "List Labeling Box", href: "/pages/labeling-box" },
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
              <Card size="small" title="Buat Labeling Box" bordered={true}>
                <Col className="gutter-row" xs={24} md={12}>
                  <Checkbox onChange={onChange}>Scan Mode</Checkbox>
                </Col>

                {checkedScan && (
                  <Form
                    name="addScan"
                    className="gap-10"
                    layout="inline"
                    onFinish={async (value) => {
                      try {
                        setLoading(true);
                        setLoadingTable(true);
                        const dataScan = await scanDataLabelingProduct({
                          codeLabel: value.codelabel,
                        });

                        if (dataScan.success) {
                          if (dataScan.value) {
                            const { labelingProductId } = dataScan.value;

                            const idExists = _.some(labelingProductList, {
                              labelingProductId: labelingProductId,
                            });

                            if (!idExists) {
                              setLabelingProductList((prevArray) => [
                                ...prevArray,
                                dataScan.value,
                              ]);
                            }
                          } else {
                            messageApi.error("No data returned for the scan.");
                          }
                        } else {
                          messageApi.error(dataScan.error);
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
                    <Form.Item label="Labeling Code Product" name="codelabel">
                      <Input className="w-full" />
                    </Form.Item>

                    <Form.Item>
                      <ConfigProvider
                        theme={{ token: { colorPrimary: "red" } }}
                      >
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
                  </Form>
                )}

                <Form
                  name="addBox"
                  className="gap-10"
                  layout="vertical"
                  form={addForm}
                  onFinish={async (value) => {
                    try {
                      setLoading(true);
                      setLoadingTable(true);
                      const genBox = await addLabelingBoxs({
                        leader: value.leader,
                        labelingProductId: rowSelectionModel as any,
                        createdBy: session?.user?.name ?? "",
                      });

                      if (genBox.success) {
                        addForm.resetFields();
                        setLabelingProductList((prev) =>
                          prev.filter(
                            (o) =>
                              !rowSelectionModel.includes(o.labelingProductId)
                          )
                        );
                        setRowSelectionModel([]);
                        fetchLabelingBox();
                        messageApi.success("Generate labeling box berhasil");
                      } else {
                        messageApi.error(genBox.error);
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
                  <div className="h-[400px] overflow-y-auto my-5 py-2">
                    <DataGridPremium
                      loading={loadingTable}
                      pageSizeOptions={[10, 100, 1000]}
                      rows={labelingProductList}
                      disableRowSelectionOnClick
                      initialState={{
                        pagination: {
                          paginationModel: { pageSize: 1000, page: 0 },
                        },
                      }}
                      slots={{
                        toolbar: () => (
                          <GridToolbarContainer>
                            <GridToolbarQuickFilter />
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
                          field: "codeLabel",
                          headerName: "labling product",
                          width: 500,
                          editable: true,
                        },
                      ]}
                    />
                  </div>

                  <Form.Item
                    label="Leader"
                    name="leader"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Leader!",
                      },
                    ]}
                  >
                    <Input className="w-full" />
                  </Form.Item>

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
                rows={labelingBoxList}
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

                      <Box sx={{ flexGrow: 1 }} />
                      <Button
                        onClick={async () => {
                          if (_.isEmpty(rowSelectionBoxModel)) {
                            messageApi.error("Pilih product terlebih dahulu.");
                          } else {
                            setLoading(true);
                            const printered = await printLabelingBox({
                              labelingBoxId: rowSelectionBoxModel as any,
                              updatedBy: session?.user?.name ?? "",
                            });

                            if (printered.success) {
                              setLabelingBoxList((prevRows) =>
                                prevRows.map((row) =>
                                  rowSelectionBoxModel.includes(
                                    row.labelingBoxId
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
                  setRowSelectionBoxModel(newSelection);
                }}
                rowSelection
                pagination
                disableColumnResize={false}
                getRowId={(row) => row.labelingBoxId}
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
                    field: "codeBox",
                    headerName: "Labeling Box",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "total",
                    headerName: "Total product",
                    width: 250,
                    type: "number",
                    editable: false,
                  },
                  {
                    field: "leader",
                    headerName: "Leader",
                    minWidth: 250,
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
