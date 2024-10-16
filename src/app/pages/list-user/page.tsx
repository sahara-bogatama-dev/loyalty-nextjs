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
  Modal,
  List,
  Select,
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import {
  addRoles,
  allUserData,
  createInternalUser,
  currentRoleUser,
  deleteRoles,
  roleUser,
  updateUsers,
} from "@/controller/listUser/action";
import HeaderBar from "@/app/component/header.comp";
import moment from "moment";
import _ from "lodash";
import dayjs from "dayjs";
import {
  DataGridPremium,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridRowModesModel,
  GridRowModes,
  GridRowId,
  GridRowModel,
  GridEventListener,
  GridRowEditStopReasons,
  GridActionsCellItem,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import { MdCancel } from "react-icons/md";
import { FaSave, FaEdit } from "react-icons/fa";
import { PiUserGearFill } from "react-icons/pi";

export default function Home() {
  const { Content } = Layout;
  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingTable, setLoadingTable] = React.useState(false);
  const [loadingModal, setLoadingModal] = React.useState(false);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [userList, setUserList] = React.useState<any[]>([]);
  const [isModalRoleOpen, setIsModalRoleOpen] = React.useState(false);
  const [isRole, setRole] = React.useState<
    { id: string; name: string; userId: string }[]
  >([]);
  const [listRole, setListRole] = React.useState<
    { id: string; name: string }[]
  >([]);

  const [addForm] = Form.useForm();
  const [rolesForm] = Form.useForm();

  const fetchUser = React.useCallback(async () => {
    const user = await allUserData();

    if (user.success) {
      setUserList(user.value.result as any);
    } else {
      messageApi.open({
        type: "error",
        content: user.error,
      });
    }
  }, [messageApi]);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleRoleClick = (id: GridRowId) => async () => {
    setLoadingModal(true);
    setIsModalRoleOpen(true);
    rolesForm.setFieldsValue({ userIdRoles: id });
    const listRole = await roleUser();
    const currentRoles = await currentRoleUser({ userId: id.toString() });

    if (currentRoles.success) {
      setRole(currentRoles.value.result);
    } else {
      messageApi.open({
        type: "error",
        content: currentRoles.error,
      });
    }

    if (listRole.success) {
      setListRole(listRole.value.result);
    } else {
      messageApi.open({
        type: "error",
        content: listRole.error,
      });
    }
    setLoadingModal(false);
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
    const updateRow = await updateUsers({
      userId: newRow.id,
      inActive: newRow.inActive,
      fullname: newRow.name,
      phone: newRow.phone,
      email: newRow.email,
      bod: newRow.dateOfBirth,
      leader: newRow.leader,
      updatedBy: session?.user?.name ?? "",
    });

    if (updateRow.success) {
      setUserList((prevRows) =>
        prevRows.map((row) =>
          row.id === newRow.id
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
        [newRow.id]: {
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
              { title: "List User", href: "/pages/list-user" },
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
              <Card size="small" title="Buat user" bordered={true}>
                <Form
                  name="createUser"
                  className="gap-10"
                  form={addForm}
                  onFinish={async (value) => {
                    try {
                      setLoading(true);
                      setLoadingTable(true);
                      const createUser = await createInternalUser({
                        email: value.email,
                        fullname: value.fullname,
                        dateofbirth: dayjs(value.dateofbirth).format(
                          "DD-MM-YYYY"
                        ),
                        phone: value.phone,
                        leader: value.leader,
                        createdBy: session?.user?.name ?? undefined,
                      });

                      if (createUser.success) {
                        setUserList((prevUser) => [
                          ...prevUser,
                          {
                            id: createUser.value?.id,
                            createdAt: createUser.value?.createdAt,
                            createdBy: createUser.value?.createdBy,
                            dateOfBirth: createUser.value?.dateOfBirth,
                            email: createUser.value?.email,
                            inActive: createUser.value?.inActive,
                            leader: createUser.value?.leader,
                            name: createUser.value?.name,
                            phone: createUser.value?.phone,
                            role: [] as any[],
                            updatedAt: createUser.value?.updatedAt,
                            updatedBy: createUser.value?.updatedBy,
                            username: createUser.value?.username,
                          },
                        ]);
                        addForm.resetFields();
                        messageApi.open({
                          type: "success",
                          content: "Akun sudah dibuat. Silahkan check email.",
                        });
                        fetchUser();
                      } else {
                        messageApi.open({
                          type: "error",
                          content: createUser.error,
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
                        label="fullname"
                        name="fullname"
                        rules={[
                          {
                            required: true,
                            message: "Please input your fullname!",
                          },
                        ]}
                      >
                        <Input maxLength={100} />
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="email"
                        name="email"
                        rules={[
                          {
                            required: true,
                            message: "Please input your email!",
                            type: "email",
                          },
                        ]}
                      >
                        <Input type="email" maxLength={100} />
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="No. HP"
                        name="phone"
                        rules={[
                          {
                            required: true,
                            message: "Please input your phone!",
                          },
                        ]}
                      >
                        <Input maxLength={15} placeholder="086562562566" />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Tanggal lahir"
                        name="dateofbirth"
                        rules={[
                          {
                            required: true,
                            message: "Please input your date!",
                          },
                        ]}
                      >
                        <DatePicker className="w-full" format={"DD-MM-YYYY"} />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item label="Atasan/Leader" name="leader">
                        <Input maxLength={100} />
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
                        Buat akun
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
                loading={loadingTable}
                pageSizeOptions={[10, 100, 1000]}
                rows={userList}
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
                    </GridToolbarContainer>
                  ),
                }}
                pagination
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
                          icon={<PiUserGearFill />}
                          label="Roles"
                          className="textPrimary"
                          color="inherit"
                          onClick={handleRoleClick(id)}
                        />,
                      ];
                    },
                  },

                  {
                    field: "inActive",
                    headerName: "Inactive",
                    type: "boolean",
                    width: 120,
                    editable: true,
                  },
                  {
                    field: "name",
                    headerName: "Nama Lengkap",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "username",
                    headerName: "Username",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "email",
                    headerName: "Email",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "phone",
                    headerName: "No. HP",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "dateOfBirth",
                    headerName: "Tanggal Lahir",
                    minWidth: 250,
                    headerAlign: "center",
                    type: "date",
                    editable: true,
                    valueFormatter: (params) => {
                      dayjs(params, "DD-MM-YYYY").toDate();
                    },
                  },
                  {
                    field: "leader",
                    headerName: "Leader / Atasan",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "role",
                    headerName: "Roles",
                    headerAlign: "center",
                    minWidth: 250,
                    editable: false,
                    renderCell: (params) => {
                      return (
                        <span className="text-black">
                          {_.map(
                            params.formattedValue,
                            (item) => item.name
                          ).join(", ")}
                        </span>
                      );
                    },
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
        title="Add Role"
        open={isModalRoleOpen}
        loading={loadingModal}
        onCancel={() => {
          setIsModalRoleOpen(false);
          setRole([]);

          rolesForm.resetFields();
        }}
        footer={null}
        destroyOnClose={true}
      >
        <div className="h-[300px] overflow-auto p-2">
          <Form
            name="roleForm"
            layout="vertical"
            labelCol={{ span: 16 }}
            wrapperCol={{ span: 24 }}
            form={rolesForm}
            onFinish={async (value) => {
              setLoading(true);

              const addRole = await addRoles({
                idRole: value.roles,
                userId: value.userIdRoles,
                createdBy: session?.user?.name as string,
              });

              if (addRole.success) {
                setUserList((prevRows) =>
                  prevRows.map((row) =>
                    row.id === value.userIdRoles
                      ? {
                          ...row,
                          role: [
                            ...row.role,
                            { id: addRole.value.id, name: addRole.value.name },
                          ],
                        }
                      : row
                  )
                );

                setRole((prevRoles) => [
                  ...prevRoles,
                  {
                    id: addRole.value.id,
                    name: addRole.value.name,
                    userId: value.userIdRoles,
                  },
                ]);

                messageApi.open({
                  type: "success",
                  content: "Role berhasil di tambahkan.",
                });
              } else {
                messageApi.open({
                  type: "error",
                  content: addRole.error,
                });
              }
              setLoading(false);
            }}
            autoComplete="off"
          >
            <Form.Item name="userIdRoles" hidden>
              <Input />
            </Form.Item>
            <Form.Item
              label="Select Role"
              name="roles"
              rules={[{ required: true, message: "Please input!" }]}
            >
              <Select
                showSearch
                options={_.map(listRole, (o) => ({
                  value: o.id,
                  label: <span>{o.name}</span>,
                }))}
                virtual={false}
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 0, span: 2 }}>
              <ConfigProvider theme={{ token: { colorPrimary: "red" } }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit
                </Button>
              </ConfigProvider>
            </Form.Item>
          </Form>

          <List
            className="demo-loadmore-list"
            itemLayout="horizontal"
            dataSource={isRole}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    loading={loading}
                    onClick={async () => {
                      setLoading(true);

                      const deleteRole = await deleteRoles({
                        id: item.userId,
                        idRole: item.id,
                      });

                      if (deleteRole.success) {
                        setUserList((prevRows) =>
                          prevRows.map((row) =>
                            row.id === item.userId
                              ? {
                                  ...row,
                                  role: _.reject(row.role, {
                                    id: item.id,
                                  }),
                                }
                              : row
                          )
                        );

                        setRole((prevRole) =>
                          _.reject(prevRole, { id: item.id })
                        );

                        console.log(userList);

                        messageApi.open({
                          type: "success",
                          content: "Role berhasil di hapus.",
                        });
                      } else {
                        messageApi.open({
                          type: "error",
                          content: deleteRole.error,
                        });
                      }
                      setLoading(false);
                    }}
                    key="list-loadmore-edit"
                  >
                    delete
                  </Button>,
                ]}
              >
                <span>{item.name}</span>
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </Layout>
  );
}
