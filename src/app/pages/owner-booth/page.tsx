"use client";

import React from "react";
import {
  Button,
  Layout,
  theme,
  Breadcrumb,
  Form,
  Input,
  message,
  ConfigProvider,
  DatePicker,
  Modal,
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import HeaderBar from "@/app/component/header.comp";
import { Box, Pagination } from "@mui/material";
import _ from "lodash";
import moment from "moment";
import "react-photo-view/dist/react-photo-view.css";

import {
  DataGridPremium,
  GridActionsCellItem,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { MdPhoto } from "react-icons/md";
import { listMember, listOwner } from "@/controller/booth/action";

export default function Home() {
  const { Content } = Layout;
  const { RangePicker } = DatePicker;

  const [baseUrl, setBaseUrl] = React.useState("");

  const [collapsed, setCollapsed] = React.useState(false);
  const [loadingTable, setLoadingTable] = React.useState(false);
  const [loadingModal, setLoadingModal] = React.useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [boothList, setBoothList] = React.useState<any[]>([]);
  const [memberList, setMemberList] = React.useState<any[]>([]);
  const [isModalMemberOpen, setIsModalMemberOpen] = React.useState(false);

  const fetchListOwner = React.useCallback(async () => {
    setLoadingTable(true);
    const owners = await listOwner();
    if (owners.success) {
      setBoothList(owners.value.result as any);
    } else {
      messageApi.open({
        type: "error",
        content: owners.error,
      });
    }
    setLoadingTable(false);
  }, [messageApi]);

  const fetchListMember = React.useCallback(
    async ({ boothId }: { boothId: string }) => {
      setLoadingModal(true);
      const member = await listMember({ boothId });
      if (member.success) {
        setMemberList(member.value.result as any);
      } else {
        messageApi.open({
          type: "error",
          content: member.error,
        });
      }
      setLoadingModal(false);
    },
    [messageApi]
  );

  React.useEffect(() => {
    fetchListOwner();

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
            <div style={{ height: 500, width: "100%", marginTop: 10 }}>
              <DataGridPremium
                rows={boothList}
                getRowId={(row) => row.boothId}
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
                getRowHeight={() => "auto"}
                rowSelection={false}
                columns={[
                  {
                    field: "totalMember",
                    headerName: "Total Member",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                    type: "actions",
                    getActions: ({ id, row }: GridRowParams) => {
                      return [
                        <a
                          key={id.toString()}
                          onClick={() => {
                            setIsModalMemberOpen(true);
                            fetchListMember({ boothId: id.toString() });
                          }}
                        >
                          {row.totalMember}
                        </a>,
                      ];
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
                        <a
                          href={`https://www.google.com/maps?q=${params.row.geolocation}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          type="link"
                        >
                          {params.formattedValue}
                        </a>
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

      <Modal
        title="Booth Member"
        open={isModalMemberOpen}
        onCancel={() => {
          setIsModalMemberOpen(false);
          setMemberList([]);
        }}
        footer={null}
        destroyOnClose={true}
        width={1000}
        loading={loadingModal}
      >
        <div style={{ height: 500, width: "100%", marginTop: 10 }}>
          <DataGridPremium
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
            pageSizeOptions={[10, 100, 1000]}
            pagination
            disableRowSelectionOnClick
            headerFilters
            initialState={{
              pagination: {
                paginationModel: { pageSize: 1000, page: 0 },
              },
            }}
            getRowHeight={() => "auto"}
            rowSelection={false}
            rows={memberList}
            getRowId={(row) => row.boothMemberId}
            columns={[
              {
                field: "photoBooth",
                headerName: "Image",
                type: "actions",
                minWidth: 250,
                headerAlign: "center",
                editable: false,
                align: "center",
                getActions: ({ id }) => [
                  <PhotoProvider key={id} className="text-xs">
                    <PhotoView
                      src={`${baseUrl}/api/booth/image/${id.toString()}`}
                    >
                      <GridActionsCellItem
                        icon={<MdPhoto />}
                        label="Tampilkan Gambar"
                        className="textPrimary"
                        color="inherit"
                      />
                    </PhotoView>
                  </PhotoProvider>,
                ],
              },
              {
                field: "fullname",
                headerName: "Member Name",
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
                    <a
                      href={`https://www.google.com/maps?q=${params.row.geolocation}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      type="link"
                    >
                      {params.formattedValue}
                    </a>
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
    </Layout>
  );
}
