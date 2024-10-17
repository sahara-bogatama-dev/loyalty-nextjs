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
import { FaCheckCircle } from "react-icons/fa";
import { approveRedeem, listDataRedeem } from "@/controller/redeem/action";

export default function Home() {
  const { Content } = Layout;
  const [collapsed, setCollapsed] = React.useState(false);

  const [loadingTable, setLoadingTable] = React.useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();

  const [redeemList, setRedeemList] = React.useState<any[]>([]);

  const fetchRedeem = React.useCallback(async () => {
    setLoadingTable(true);
    const data = await listDataRedeem({ email: session?.user?.email ?? "" });

    if (data.success) {
      setRedeemList(data.value);
    } else {
      messageApi.error(data.error);
    }
    setLoadingTable(false);
  }, [messageApi, session?.user?.email]);

  React.useEffect(() => {
    fetchRedeem();
  }, [fetchRedeem]);

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
                rows={redeemList}
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
                getRowId={(row) => row.redeemId}
                columns={[
                  {
                    field: "actions",
                    type: "actions",
                    headerName: "Actions",
                    width: 100,
                    cellClassName: "actions",
                    getActions: ({ id, row }) => {
                      return row.statusCode === 1
                        ? [
                            <GridActionsCellItem
                              key={1}
                              icon={<FaCheckCircle />}
                              label="Approve"
                              className="textPrimary"
                              color="inherit"
                              showInMenu
                              onClick={async () => {
                                setLoadingTable(true);
                                try {
                                  // API call to approve redeem
                                  const data = await approveRedeem({
                                    redeemId: id.toString(),
                                    updatedBy: session?.user?.name ?? "",
                                  });

                                  if (data.success) {
                                    messageApi.success("Approved");

                                    setRedeemList((prev) =>
                                      prev.map((row) =>
                                        row.redeemId === id.toString()
                                          ? {
                                              ...row,
                                              status: "Approve",
                                              statusColor: "green",
                                              statusCode: 3,
                                              updatedAt: dayjs().toDate(),
                                              updatedBy:
                                                session?.user?.name ?? "",
                                            }
                                          : row
                                      )
                                    );
                                  } else {
                                    messageApi.error(data.error);
                                  }
                                } catch (error) {
                                  messageApi.error(
                                    "An error occurred while approving"
                                  );
                                } finally {
                                  // Always set loading to false after operation
                                  setLoadingTable(false);
                                }
                              }}
                            />,
                          ]
                        : [];
                    },
                  },
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
                    field: "redeemCode",
                    headerName: "Code",
                    width: 250,
                    type: "string",
                    editable: false,
                  },
                  {
                    field: "packageName",
                    headerName: "Package Name",
                    width: 250,
                    type: "string",
                    editable: false,
                  },
                  {
                    field: "fullname",
                    headerName: "Fullname",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "email",
                    headerName: "Email",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "phone",
                    headerName: "Phone",
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
