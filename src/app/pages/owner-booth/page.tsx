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
  Table,
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import {
  addAgents,
  addCampaigns,
  currentProducts,
  dataMember,
  deleteAgents,
  deleteCampaigns,
  disableCampaigns,
  downloadAgents,
  listProducts,
  paginationAgent,
  paginationCampaign,
  paginationOwner,
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

import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";

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
  const [boothList, setBoothList] = React.useState<any[]>([]);
  const [memberList, setMemberList] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isModalMemberOpen, setIsModalMemberOpen] = React.useState(false);
  const [totalMemberPage, setTotalMemberPage] = React.useState<number>(0);
  const [currentMemberPage, setCurrentMemberPage] = React.useState<number>(1);

  const fetchListOwner = React.useCallback(
    async ({ take, skip }: { skip: number; take: number }) => {
      const owners = await paginationOwner({ take, skip });
      if (owners.success) {
        console.log(owners.value.result);
        setBoothList(owners.value.result as any);
        setTotalPage(Math.ceil(owners.value.count / 100));
      } else {
        messageApi.open({
          type: "error",
          content: owners.error,
        });
      }
    },
    [messageApi]
  );

  React.useEffect(() => {
    fetchListOwner({
      skip: 0,
      take: 100,
    });

    const { protocol, hostname, port } = window.location;
    setBaseUrl(`${protocol}//${hostname}${port ? `:${port}` : ""}`);
  }, [fetchListOwner]);

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
              { title: "Owner Booth", href: "/pages/owner-booth" },
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
            <Form
              name="searchForm"
              layout="inline"
              onFinish={async (value) => {
                setLoading(true);

                const searchAgent = await searchAgens({
                  searchText: value.search,
                });

                if (searchAgent.success) {
                  setBoothList(searchAgent.value);
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
                    }}
                  >
                    Reset
                  </Button>
                </ConfigProvider>
              </Form.Item>
            </Form>
            <div style={{ height: 500, width: "100%", marginTop: 10 }}>
              <DataGridPremium
                rows={boothList}
                getRowId={(row) => row.boothId}
                disableRowSelectionOnClick
                headerFilters
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                  },
                }}
                autoPageSize
                pagination
                columns={[
                  {
                    field: "_count",
                    headerName: "Booth",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,

                    renderCell(params) {
                      return (
                        <Button
                          onClick={async () => {
                            setIsModalMemberOpen(true);
                            setLoadingModal(true);

                            const fetchMember = await dataMember({
                              take: 100,
                              skip: 0,
                            });

                            if (fetchMember.success) {
                              setMemberList(fetchMember.value.result as any);
                              setTotalMemberPage(
                                Math.ceil(fetchMember.value.count / 100)
                              );
                            } else {
                              messageApi.open({
                                type: "error",
                                content: fetchMember.error,
                              });
                            }

                            setLoadingModal(false);
                          }}
                          type="link"
                        >
                          Total Booth ({params.formattedValue.boothMember})
                        </Button>
                      );
                    },
                  },
                  {
                    field: "fullname",
                    headerName: "Owner Name",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "address",
                    headerName: "Address",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                    renderCell(params) {
                      return (
                        <Button
                          href={`https://www.google.com/maps?q=${params.row.geolocation}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          type="link"
                        >
                          {params.formattedValue}
                        </Button>
                      );
                    },
                  },
                  {
                    field: "email",
                    headerName: "Email",
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
                    field: "dateEstablishment",
                    headerName: "Sejak Tahun",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "instagram",
                    headerName: "instagram",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "facebook",
                    headerName: "facebook",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "ecommerce",
                    headerName: "Ecommerce",
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
                      moment(params).format("DD/MM/YYYY HH:mm"),
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
                      moment(params).format("DD/MM/YYYY HH:mm"),
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
                  fetchListOwner({
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
        title="Booth Member"
        open={isModalMemberOpen}
        onCancel={() => {
          setIsModalMemberOpen(false);
        }}
        footer={null}
        destroyOnClose={true}
        width={1000}
        loading={loadingModal}
      >
        <Form
          name="searchForm"
          layout="inline"
          onFinish={async (value) => {
            setLoading(true);

            const searchAgent = await searchAgens({
              searchText: value.search,
            });

            if (searchAgent.success) {
              setBoothList(searchAgent.value);
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
              <Button loading={loading} type="primary" htmlType="submit" block>
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
            getRowHeight={() => "auto"}
            slots={{
              toolbar: () => (
                <div className="flex items-center m-2 gap-2">
                  <GridToolbarQuickFilter placeholder="Filter by data table" />

                  <Button type="link" onClick={() => {}}>
                    Export
                  </Button>
                </div>
              ),
            }}
            pagination={true}
            rowSelection={false}
            rows={memberList}
            getRowId={(row) => row.boothMemberId}
            columns={[
              {
                field: "fullname",
                headerName: "Owner Name",
                minWidth: 250,
                headerAlign: "center",
                editable: false,
              },
              {
                field: "address",
                headerName: "Address",
                minWidth: 250,
                headerAlign: "center",
                editable: false,
                renderCell(params) {
                  return (
                    <Button
                      href={`https://www.google.com/maps?q=${params.row.geolocation}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      type="link"
                    >
                      {params.formattedValue}
                    </Button>
                  );
                },
              },
              {
                field: "email",
                headerName: "Email",
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
                field: "dateEstablishment",
                headerName: "Sejak Tahun",
                minWidth: 250,
                headerAlign: "center",
                editable: false,
              },
              {
                field: "instagram",
                headerName: "instagram",
                minWidth: 250,
                headerAlign: "center",
                editable: false,
              },
              {
                field: "facebook",
                headerName: "facebook",
                minWidth: 250,
                headerAlign: "center",
                editable: false,
              },
              {
                field: "ecommerce",
                headerName: "Ecommerce",
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
                valueFormatter: (params) => moment(params).format("DD/MM/YYYY"),
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
                valueFormatter: (params) => moment(params).format("DD/MM/YYYY"),
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
              fetchListOwner({
                skip: Math.max(0, (value - 1) * 100),
                take: 100,
              });
            }}
            shape="rounded"
          />
        </div>
      </Modal>
    </Layout>
  );
}
