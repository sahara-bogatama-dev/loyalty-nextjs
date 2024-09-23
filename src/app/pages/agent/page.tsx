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
  InputProps,
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
import InputMask from "react-input-mask";

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

  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isModalEditOpen, setIsModalEditOpen] = React.useState(false);

  React.useEffect(() => {}, []);

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
                  form={addForm}
                  onFinish={async (value) => {
                    try {
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
                        label="Store Address"
                        name="storeAddress"
                        rules={[
                          {
                            required: true,
                            message: "Please input your store address!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="NPWP"
                        name="npwp"
                        rules={[
                          {
                            required: true,
                            message: "Please input your NPWP!",
                          },
                        ]}
                      >
                        <InputMask mask="99.999.999.9-999.999">
                          {(inputProps: any) => <Input {...inputProps} />}
                        </InputMask>
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
                        <InputMask mask="(999) 9999999999999">
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              placeholder="081xxxxxx/021xxxxxxx"
                            />
                          )}
                        </InputMask>
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
                            message: "",
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
                        <InputMask mask="(999) 9999999999999">
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              placeholder="081xxxxxx/021xxxxxxx"
                            />
                          )}
                        </InputMask>
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
              onFinish={async (value) => {}}
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
                    onClick={() => {}}
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
                rows={[]}
                getRowId={(row) => row.agentId}
                columns={[
                  {
                    field: "actions",
                    type: "actions",
                    getActions: (params: GridRowParams) => [
                      <GridActionsCellItem
                        key={params.id.toString()}
                        onClick={() => {}}
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
                    headerName: "Store Address",
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
                    field: "NPWP",
                    headerName: "noNpwp",
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
                ) => {}}
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
      ></Modal>
    </Layout>
  );
}
