"use client";

import React, { ReactNode } from "react";
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
  InputProps,
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import {
  addAgents,
  addCampaigns,
  currentProducts,
  deleteCampaigns,
  disableCampaigns,
  downloadAgents,
  listProducts,
  paginationAgent,
  paginationCampaign,
  searchAgens,
  searchCampaigns,
  updateAgents,
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
import MaskedInput from "antd-mask-input";
import * as XLSX from "xlsx";

export default function Home() {
  const { Content } = Layout;
  const { RangePicker } = DatePicker;

  const [baseUrl, setBaseUrl] = React.useState("");

  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingModal, setLoadingModal] = React.useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [agentList, setAgentList] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isModalEditOpen, setIsModalEditOpen] = React.useState(false);

  const [addAgent] = Form.useForm();
  const [editAgent] = Form.useForm();

  const fetchAgent = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      const listAgent = await paginationAgent({ skip, take });

      if (listAgent.success) {
        setAgentList(listAgent.value.result as any);
        setTotalPage(Math.ceil(listAgent.value.count / 100));
      } else {
        messageApi.open({
          type: "error",
          content: listAgent.error,
        });
      }
    },
    [messageApi]
  );

  React.useEffect(() => {
    fetchAgent({ skip: 0, take: 100 });
  }, [fetchAgent]);

  const exportAgent = async () => {
    const allAgent = await downloadAgents();

    if (allAgent.success) {
      const ws = XLSX.utils.json_to_sheet(allAgent.value);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(
        wb,
        `Sahara Agent ${moment().format("DD-MM-YYYY")}-${
          Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
        }.xlsx`
      );
    } else {
      messageApi.open({
        type: "error",
        content: allAgent.error,
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
                        fetchAgent({ skip: 0, take: 100 });
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

            <Form
              name="searchForm"
              layout="inline"
              onFinish={async (value) => {
                setLoading(true);

                const searchAgent = await searchAgens({
                  searchText: value.search,
                });

                if (searchAgent.success) {
                  setAgentList(searchAgent.value);
                  setTotalPage(0);
                  setCurrentPage(0);
                } else {
                  messageApi.open({
                    type: "error",
                    content: searchAgent.error,
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
                      fetchAgent({ take: 100, skip: 0 });
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

                      <Button
                        type="link"
                        onClick={() => {
                          exportAgent();
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
                rows={agentList}
                getRowId={(row) => row.agentId}
                columns={[
                  {
                    field: "actions",
                    type: "actions",
                    getActions: (params: GridRowParams) => [
                      <GridActionsCellItem
                        key={params.id.toString()}
                        onClick={() => {
                          setIsModalEditOpen(true);

                          editAgent.setFieldsValue({
                            agentId: params.id.toString(),
                            customerName: params.row.customerName,
                            storeAddress: params.row.storeAddress,
                            email: params.row.email,
                            npwp: params.row.noNpwp,
                            picName: params.row.picName,
                            picHP: params.row.picPhone,
                            phoneAgent: params.row.phone,
                          });
                        }}
                        label="Edit"
                        icon={<FaEdit />}
                        showInMenu
                      />,
                      <GridActionsCellItem
                        key={params.id.toString()}
                        icon={<FaTrash />}
                        onClick={async () => {}}
                        label="Delete"
                        showInMenu
                      />,
                    ],
                  },

                  {
                    field: "customerName",
                    headerName: "Nama Customer",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "storeAddress",
                    headerName: "Address",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "email",
                    headerName: "Email",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "noNpwp",
                    headerName: "NPWP",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "phone",
                    headerName: "Phone",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "picName",
                    headerName: "PIC Name",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "picPhone",
                    headerName: "PIC No. Handphone",
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
                  fetchAgent({
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
        title="Edit Agent"
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
          form={editAgent}
          name="editAgent"
          className="gap-10"
          onFinish={async (value) => {
            try {
              setLoading(true);

              const updateAgent = await updateAgents({
                email: value.email,
                phone: value.phoneAgent,
                customerName: value.customerName,
                storeAddress: value.storeAddress,
                picName: value.picName,
                picPhone: value.picHP,
                updatedBy: session?.user?.name || "",
                noNpwp: value.npwp,
                agentId: value.agentId,
              });

              if (updateAgent.success) {
                fetchAgent({
                  skip: Math.max(0, (currentPage - 1) * 100),
                  take: 100,
                });
                messageApi.open({
                  type: "success",
                  content: "Agent berhasil ditambahkan.",
                });
              } else {
                messageApi.open({
                  type: "error",
                  content: updateAgent.error,
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
            <Form.Item name="agentId" hidden>
              <Input />
            </Form.Item>
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
                    message: "Please input your agent address!",
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
              <Button loading={loading} type="primary" htmlType="submit" block>
                Update Agent
              </Button>
            </ConfigProvider>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
