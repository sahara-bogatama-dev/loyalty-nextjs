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
  createInternalUser,
  deleteRoles,
  disableUsers,
  paginationUser,
  roleUser,
  searchUsers,
  updateUsers,
} from "@/controller/action";
import HeaderBar from "@/app/component/header.comp";
import moment from "moment";
import {
  DataGrid,
  GridActionsCellItem,
  GridRowParams,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Pagination } from "@mui/material";
import _ from "lodash";
import { FaEdit } from "react-icons/fa";
import { PiUserGearFill } from "react-icons/pi";
import { MdDisabledByDefault } from "react-icons/md";
import dayjs from "dayjs";

export default function Home() {
  const { Content } = Layout;
  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [userList, setUserList] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isModalRoleOpen, setIsModalRoleOpen] = React.useState(false);
  const [isRole, setRole] = React.useState<{ id: string; name: string }[]>([]);
  const [listRole, setListRole] = React.useState<
    { id: string; name: string }[]
  >([]);

  const [isModalEditOpen, setIsModalEditOpen] = React.useState(false);
  const [idEdit, setIdEdit] = React.useState("");

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [rolesForm] = Form.useForm();

  const [isFormFilled, setIsFormFilled] = React.useState(false);

  const onValuesChange = (changedValues: any) => {
    const values = editForm.getFieldsValue();
    const anyFilled = Object.values(values).some((value) => value);

    setIsFormFilled(anyFilled);
  };

  const fetchUser = React.useCallback(
    async ({ take, skip }: { skip: number; take: number }) => {
      const user = await paginationUser({ take, skip });

      if (user.success) {
        setUserList(user.value.result as any);
        setTotalPage(Math.ceil(user.value.count / 100));
      } else {
        messageApi.open({
          type: "error",
          content: user.error,
        });
      }
    },
    [messageApi]
  );

  React.useEffect(() => {
    fetchUser({ take: 100, skip: 0 });
  }, [fetchUser]);

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
                        fetchUser({
                          skip: Math.max(0, (currentPage - 1) * 100),
                          take: 100,
                        });
                        addForm.resetFields();
                        messageApi.open({
                          type: "success",
                          content: "Akun sudah dibuat. Silahkan check email.",
                        });
                      } else {
                        messageApi.open({
                          type: "error",
                          content: createUser.error,
                        });
                      }
                      setLoading(false);
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

            <Form
              name="searchForm"
              layout="inline"
              onFinish={async (value) => {
                setLoading(true);

                const searchUser = await searchUsers({
                  searchText: value.search,
                });

                if (searchUser.success) {
                  setUserList(searchUser.value);
                  setTotalPage(0);
                  setCurrentPage(0);
                } else {
                  messageApi.open({
                    type: "error",
                    content: searchUser.error,
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
                <Input placeholder="Product Name or Product Code" />
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
                      fetchUser({ take: 100, skip: 0 });
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
                slots={{
                  toolbar: () => (
                    <div className="flex items-center m-2">
                      <GridToolbarQuickFilter placeholder="Filter by data table" />
                    </div>
                  ),
                }}
                pagination={true}
                getRowHeight={() => "auto"}
                rowSelection={false}
                rows={userList}
                columns={[
                  {
                    field: "actions",
                    type: "actions",
                    getActions: (params: GridRowParams) => [
                      <GridActionsCellItem
                        key={params.id.toString()}
                        icon={<FaEdit />}
                        onClick={() => {
                          setIsModalEditOpen(true);
                          editForm.setFieldsValue({
                            userId: params.id.toString(),
                          });
                        }}
                        label="Edit"
                        showInMenu
                      />,
                      <GridActionsCellItem
                        key={params.id.toString()}
                        icon={<PiUserGearFill />}
                        onClick={async () => {
                          setIdEdit(params.id.toString());
                          setRole(params.row.role);
                          rolesForm.setFieldsValue({
                            userIdRoles: params.id.toString(),
                          });

                          setIsModalRoleOpen(true);

                          const listRole = await roleUser();

                          if (listRole.success) {
                            setListRole(listRole.value.result);
                          } else {
                            messageApi.open({
                              type: "error",
                              content: listRole.error,
                            });
                          }
                        }}
                        label="Role"
                        showInMenu
                      />,
                      <GridActionsCellItem
                        key={params.id.toString()}
                        icon={<MdDisabledByDefault />}
                        onClick={async () => {
                          const disableUser = await disableUsers({
                            updatedBy: session?.user?.name ?? undefined,
                            idEdit: params.id.toString(),
                            disable: !params.row.inActive,
                          });

                          if (disableUser.success) {
                            fetchUser({
                              skip: Math.max(0, (currentPage - 1) * 100),
                              take: 100,
                            });
                          } else {
                            messageApi.open({
                              type: "error",
                              content: disableUser.error,
                            });
                          }
                        }}
                        label={`${params.row.inActive ? "Enable" : "Disable"}`}
                        showInMenu
                      />,
                    ],
                  },
                  {
                    field: "inActive",
                    headerName: "disable",
                    type: "boolean",
                    width: 120,
                  },
                  {
                    field: "name",
                    headerName: "Nama Lengkap",
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
                    field: "phone",
                    headerName: "No. HP",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "dateOfBirth",
                    headerName: "Tanggal Lahir",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "leader",
                    headerName: "Leader / Atasan",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
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
                          ).join(",")}
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
                    valueFormatter: (params) =>
                      moment(params).format("DD/MM/YYYY hh:mm"),
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
                      moment(params).format("DD/MM/YYYY hh:mm"),
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
                  fetchUser({
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
        title="Edit User"
        open={isModalEditOpen}
        onCancel={() => {
          setIsModalEditOpen(false);
          editForm.resetFields();
        }}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          name="editUser"
          layout="vertical"
          form={editForm}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          onFinish={async (value) => {
            setLoading(true);
            const userUpdate = await updateUsers({
              idEdit: value.userId,
              updatedBy: session?.user?.name ?? undefined,
              fullname: value.fullname,
              phone: value.phone,
              email: value.email,
              leader: value.leader,
              bod: dayjs(value.dateofbirth).format("DD-MM-YYYY"),
            });

            if (userUpdate.success) {
              fetchUser({
                skip: Math.max(0, (currentPage - 1) * 100),
                take: 100,
              });
              editForm.resetFields();
              setIsModalEditOpen(false);
              messageApi.open({
                type: "success",
                content: "Update berhasil.",
              });
            } else {
              messageApi.open({
                type: "error",
                content: userUpdate.error,
              });
            }

            setLoading(false);
          }}
          autoComplete="off"
          onValuesChange={onValuesChange}
        >
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Form.Item name="userId" hidden>
              <Input />
            </Form.Item>
            <Col className="gutter-row" xs={24} md={12} xl={8}>
              <Form.Item label="fullname" name="fullname">
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" xs={24} md={12} xl={8}>
              <Form.Item
                label="email"
                name="email"
                rules={[
                  {
                    message: "Please input your email!",
                    type: "email",
                  },
                ]}
              >
                <Input type="email" maxLength={100} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" xs={24} md={12} xl={8}>
              <Form.Item label="No. HP" name="phone">
                <Input maxLength={15} placeholder="086562562566" />
              </Form.Item>
            </Col>

            <Col className="gutter-row" xs={24} md={12} xl={8}>
              <Form.Item label="Tanggal lahir" name="dateofbirth">
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
                disabled={!isFormFilled}
              >
                Update User
              </Button>
            </ConfigProvider>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Role"
        open={isModalRoleOpen}
        onCancel={() => {
          setIsModalRoleOpen(false);
          setRole([]);

          fetchUser({
            skip: Math.max(0, (currentPage - 1) * 100),
            take: 100,
          });
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
                id: session?.user?.id as string,
                idEdit: value.userIdRoles,
              });

              if (addRole.success) {
                setRole((prevRoles) => [
                  ...prevRoles,
                  { id: value.id, name: value.name },
                ]);
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
                    onClick={() => {
                      setLoading(true);
                      deleteRoles({
                        id: idEdit,
                        idRole: item.id,
                      })
                        .then((value) => {
                          if (value) {
                            const final = _.reject(isRole, { id: item.id });
                            setRole(final);
                            messageApi.open({
                              type: "success",
                              content: "Role berhasil di hapus.",
                            });
                          }
                        })
                        .catch((e) => {
                          messageApi.open({
                            type: "error",
                            content: e.message,
                          });
                        })
                        .finally(() => {
                          setLoading(false);
                        });
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
