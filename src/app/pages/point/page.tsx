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
  Modal,
  InputNumber,
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import HeaderBar from "@/app/component/header.comp";
import _, { add } from "lodash";
import {
  DataGridPremium,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  GridToolbarExport,
  GridActionsCellItem,
} from "@mui/x-data-grid-premium";
import {
  addLocationStocks,
  listDataStock,
  listDataUnlocation,
} from "@/controller/stock/action";
import dayjs from "dayjs";
import {
  addPinalty,
  listDataActivityLogPoint,
  listDataPoint,
} from "@/controller/point/action";
import { RiErrorWarningFill } from "react-icons/ri";
import { RxActivityLog } from "react-icons/rx";

export default function Home() {
  const { Content } = Layout;
  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingModal, setLoadingModal] = React.useState(false);
  const [loadingTable, setLoadingTable] = React.useState(false);

  const [showActivity, setShowActivity] = React.useState(false);
  const [showPenalty, setShowPenalty] = React.useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();

  const [pointList, setPointList] = React.useState<any[]>([]);
  const [pointActivityList, setPointActivityList] = React.useState<any[]>([]);

  const [addForm] = Form.useForm();

  const fetchPoint = React.useCallback(async () => {
    setLoadingTable(true);
    const data = await listDataPoint();

    if (data.success) {
      setPointList(data.value);
    } else {
      messageApi.error(data.error);
    }
    setLoadingTable(false);
  }, [messageApi]);

  React.useEffect(() => {
    fetchPoint();
  }, [fetchPoint]);

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
              { title: "List Point", href: "/pages/point" },
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
            <div style={{ height: 500, width: "100%", marginTop: 10 }}>
              <DataGridPremium
                loading={loadingTable}
                pageSizeOptions={[10, 100, 1000]}
                rows={pointList}
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
                      <GridToolbarExport />
                    </GridToolbarContainer>
                  ),
                }}
                pagination
                disableColumnResize={false}
                getRowId={(row) => row.pointId}
                columns={[
                  {
                    field: "actions",
                    type: "actions",
                    headerName: "Actions",
                    width: 100,
                    cellClassName: "actions",
                    getActions: ({ id, row }) => {
                      return [
                        <GridActionsCellItem
                          key={1}
                          icon={<RiErrorWarningFill />}
                          label="Penalty"
                          className="textPrimary"
                          color="inherit"
                          showInMenu
                          onClick={async () => {
                            setShowPenalty(true);

                            setLoadingModal(true);

                            addForm.setFieldsValue({ pointId: id.toString() });

                            setLoadingModal(false);
                          }}
                        />,
                        <GridActionsCellItem
                          key={1}
                          icon={<RxActivityLog />}
                          label="Log"
                          className="textPrimary"
                          color="inherit"
                          showInMenu
                          onClick={async () => {
                            setShowActivity(true);

                            setLoadingModal(true);

                            const data = await listDataActivityLogPoint({
                              pointId: id.toString(),
                            });

                            if (data.success) {
                              setPointActivityList(data.value);
                            } else {
                              messageApi.error(data.error);
                            }

                            setLoadingModal(false);
                          }}
                        />,
                      ];
                    },
                  },
                  {
                    field: "point",
                    headerName: "Total Point",
                    width: 250,
                    editable: false,
                    type: "number",
                  },
                  {
                    field: "name",
                    headerName: "Name",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "email",
                    headerName: "Email",
                    width: 250,
                    type: "string",
                    editable: false,
                  },
                  {
                    field: "phone",
                    headerName: "Phone",
                    width: 250,
                    type: "string",
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

          <Modal
            title={"Add Penalty"}
            footer={null}
            open={showPenalty}
            onCancel={() => setShowPenalty(false)}
            destroyOnClose
            loading={loadingModal}
          >
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

                  const data = await addPinalty({
                    pointId: value.pointId,
                    point: value.point,
                    updatedBy: session?.user?.name ?? "",
                  });

                  if (data.success) {
                    messageApi.success("Penalty point sudah di berikan.");
                    setPointList((prevPoint) =>
                      prevPoint.map((row) =>
                        row.pointId === value.pointId
                          ? {
                              ...row,
                              point: data.value.point,
                              updatedAt: dayjs().toDate(),
                              updatedBy: session?.user?.name ?? "",
                            }
                          : row
                      )
                    );

                    addForm.resetFields();
                    setShowPenalty(false);
                  } else {
                    messageApi.error(data.error);
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
              <Form.Item name="pointId" hidden>
                <Input className="w-full" />
              </Form.Item>

              <Form.Item
                label="point (-)"
                name="point"
                rules={[
                  {
                    required: true,
                    message: "Please input your point penalty!",
                  },
                ]}
              >
                <InputNumber
                  addonBefore="-"
                  step={1}
                  className="w-full"
                  min={0}
                />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                <ConfigProvider theme={{ token: { colorPrimary: "red" } }}>
                  <Button
                    loading={loading}
                    type="primary"
                    htmlType="submit"
                    block
                  >
                    Simpan
                  </Button>
                </ConfigProvider>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={"Activity Log Point"}
            footer={null}
            open={showActivity}
            onCancel={() => setShowActivity(false)}
            destroyOnClose
            loading={loadingModal}
          >
            <div style={{ height: 500, width: "100%", marginTop: 10 }}>
              <DataGridPremium
                loading={loadingTable}
                pageSizeOptions={[10, 100, 1000]}
                rows={pointActivityList}
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
                    </GridToolbarContainer>
                  ),
                }}
                pagination
                disableColumnResize={false}
                getRowId={(row) => row.pointLogId}
                columns={[
                  {
                    field: "status",
                    headerName: "Status",
                    width: 250,
                    editable: false,
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
                    field: "point",
                    headerName: "Point",
                    valueGetter: (value, row) => {
                      return `${row.statusCode === 1 ? "+" : "-"} ${value}`;
                    },
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "remark",
                    headerName: "Remark",
                    width: 250,
                    editable: false,
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
                    field: "scanDate",
                    headerName: "Product Code",
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
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
}
