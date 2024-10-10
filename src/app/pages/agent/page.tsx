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
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import { Box } from "@mui/material";
import _ from "lodash";
import "react-photo-view/dist/react-photo-view.css";
import { FaEdit, FaSave } from "react-icons/fa";
import MaskedInput from "antd-mask-input";
import {
  addAgents,
  deleteAgents,
  listDataAgent,
  updateAgents,
} from "@/controller/agent/action";
import { MdCancel } from "react-icons/md";
import { FaTrashCan } from "react-icons/fa6";
import dayjs from "dayjs";

export default function Home() {
  const { Content } = Layout;

  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingTable, setLoadingTable] = React.useState(false);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [agentList, setAgentList] = React.useState<any[]>([]);

  const [addAgent] = Form.useForm();

  const fetchAgent = React.useCallback(async () => {
    setLoadingTable(true);
    const listAgent = await listDataAgent();

    if (listAgent.success) {
      setAgentList(listAgent.value.result as any);
    } else {
      messageApi.open({
        type: "error",
        content: listAgent.error,
      });
    }
    setLoadingTable(false);
  }, [messageApi]);

  React.useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleRoleClick = (id: GridRowId) => async () => {
    const deleteAgent = await deleteAgents({ idAgent: id.toString() });

    if (deleteAgent.success) {
      setAgentList(agentList.filter((row) => row.agentId !== id));
    } else {
      messageApi.open({
        type: "error",
        content: deleteAgent.error,
      });
    }
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
    const updateRow = await updateAgents({
      agentId: newRow.agentId,
      customerName: newRow.customerName,
      storeAddress: newRow.storeAddress,
      email: newRow.email,
      noNpwp: newRow.noNpwp,
      phone: newRow.phone,
      picName: newRow.picName,
      picPhone: newRow.picPhone,
      updatedBy: session?.user?.name ?? "",
    });

    if (updateRow.success) {
      setAgentList((prevRows) =>
        prevRows.map((row) =>
          row.agentId === newRow.agentId
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
        [newRow.agentId]: {
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
              { title: "Agent", href: "/pages/agent" },
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
              <Card size="small" title="Tambahkan Agent" bordered={true}>
                <Form
                  name="addAgent"
                  className="gap-10"
                  form={addAgent}
                  onFinish={async (value) => {
                    try {
                      setLoading(true);

                      const newAgent = await addAgents({
                        email: value.email,
                        phone: value.phoneAgent,
                        customerName: value.customerName,
                        storeAddress: value.storeAddress,
                        picName: value.picName,
                        picPhone: value.picHP,
                        createdBy: session?.user?.name || "",
                        noNpwp: value.npwp,
                      });

                      if (newAgent.success) {
                        setAgentList((prevAgents) => [
                          ...prevAgents,
                          {
                            agentId: newAgent.value?.agentId,
                            storeAddress: newAgent.value?.storeAddress,
                            customerName: newAgent.value?.customerName,
                            email: newAgent.value?.email,
                            noNpwp: newAgent.value?.noNpwp,
                            phone: newAgent.value?.phone,
                            picName: newAgent.value?.picName,
                            picPhone: newAgent.value?.picPhone,
                            createdBy: newAgent.value?.createdBy,
                            updatedBy: newAgent.value?.updatedBy,
                            createdAt: newAgent.value?.createdAt,
                            updatedAt: newAgent.value?.updatedAt,
                          },
                        ]);
                        messageApi.open({
                          type: "success",
                          content: "Agent berhasil ditambahkan.",
                        });
                      } else {
                        messageApi.open({
                          type: "error",
                          content: newAgent.error,
                        });
                      }
                      setLoading(false);
                      addAgent.resetFields();
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
                        label="Customer Name"
                        name="customerName"
                        rules={[
                          {
                            required: true,
                            message: "Please input your customer name!",
                          },
                          {
                            max: 255,
                            message: "Max length customer name!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Agent Address"
                        name="storeAddress"
                        rules={[
                          {
                            required: true,
                            message: "Please input your Agent Address!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item label="NPWP" name="npwp">
                        <MaskedInput mask={"00.000.000.0-000.000"} />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Phone Agent"
                        name="phoneAgent"
                        rules={[
                          {
                            required: true,
                            message: "Please input your phone agent!",
                          },
                        ]}
                      >
                        <Input placeholder="021xxxxx/081xxxxx" />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          {
                            required: true,
                            message: "Please input your email!",
                          },
                          {
                            type: "email",
                            message: "Please input valid email!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="PIC Name"
                        name="picName"
                        rules={[
                          {
                            required: true,
                            message: "Please input your PIC name!",
                          },
                          {
                            max: 255,
                            message: "Max length PIC name!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="PIC no. handphone"
                        name="picHP"
                        rules={[
                          {
                            required: true,
                            message: "Please input your PIC no. handphone!",
                          },
                        ]}
                      >
                        <Input placeholder="021xxxxx/081xxxxx" />
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
                        Add Agent
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
                rows={agentList}
                getRowId={(row) => row.agentId}
                disableColumnResize={false}
                columns={[
                  {
                    field: "actions",
                    type: "actions",
                    headerName: "Actions",
                    width: 100,
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
                          icon={<FaTrashCan />}
                          label="Delete"
                          className="textPrimary"
                          color="inherit"
                          onClick={handleRoleClick(id)}
                        />,
                      ];
                    },
                  },
                  {
                    field: "customerName",
                    headerName: "Nama Customer",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "storeAddress",
                    headerName: "Address",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "email",
                    headerName: "Email",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "noNpwp",
                    headerName: "NPWP",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "phone",
                    headerName: "Phone",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "picName",
                    headerName: "PIC Name",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "picPhone",
                    headerName: "PIC No. Handphone",
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
