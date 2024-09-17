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

  const fetchUser = async ({ take, skip }: { skip: number; take: number }) => {
    const user = await paginationUser({ take, skip });
    setUserList(user.result as any);
    setTotalPage(Math.ceil(user.count / 100));
  };

  React.useEffect(() => {
    fetchUser({ take: 100, skip: 0 });
  }, []);

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
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>List User</Breadcrumb.Item>
          </Breadcrumb>
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
                  initialValues={{}}
                  onFinish={(value) => {
                    try {
                      setLoading(true);
                      createInternalUser({
                        email: value.email,
                        fullname: value.fullname,
                        dateofbirth: moment(value.dateofbirth).format(
                          "DD-MM-YYYY"
                        ),
                        phone: value.phone,
                        leader: value.leader,
                        createdBy: session?.user?.name ?? undefined,
                      })
                        .then((value) => {
                          fetchUser({
                            skip: Math.max(0, (currentPage - 1) * 100),
                            take: 100,
                          });

                          messageApi.open({
                            type: "success",
                            content: "Akun sudah dibuat. Silahkan check email.",
                          });
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
                    } catch (error: any) {
                      messageApi.open({
                        type: "error",
                        content: error.message,
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
              onFinish={(value) => {
                setLoading(true);
                searchUsers({ searchText: value.search })
                  .then((value) => {
                    setUserList(value);
                    setTotalPage(0);
                    setCurrentPage(0);
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
                <Input placeholder="fullname atau email" />
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
                          setIdEdit(params.id.toString());
                        }}
                        label="Edit"
                        showInMenu
                      />,
                      <GridActionsCellItem
                        key={params.id.toString()}
                        icon={<PiUserGearFill />}
                        onClick={() => {
                          setIdEdit(params.id.toString());
                          setRole(params.row.role);
                          setIsModalRoleOpen(true);
                          roleUser()
                            .then((value) => {
                              setListRole(value.result as any);
                            })
                            .catch((e) => {
                              messageApi.open({
                                type: "error",
                                content: e.message,
                              });
                            });
                        }}
                        label="Role"
                        showInMenu
                      />,
                      <GridActionsCellItem
                        key={params.id.toString()}
                        icon={<FaEdit />}
                        onClick={() => {
                          disableUsers({
                            updatedBy: session?.user?.name ?? undefined,
                            idEdit: params.id.toString(),
                            disable: !params.row.inActive,
                          })
                            .then(() => {
                              fetchUser({
                                skip: Math.max(0, (currentPage - 1) * 100),
                                take: 100,
                              });
                            })
                            .catch((e) => {
                              messageApi.open({
                                type: "error",
                                content: e.message,
                              });
                            });
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
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY hh:mm"),
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
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY hh:mm"),
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
        }}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          preserve={false}
          name="editUser"
          layout="vertical"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          onFinish={(value) => {
            setLoading(true);
            updateUsers({
              idEdit: idEdit,
              updatedBy: session?.user?.name ?? undefined,
              fullname: value.fullname,
              phone: value.phone,
              email: value.email,
              leader: value.leader,
              bod: moment(value.dateofbirth).format("DD-MM-YYYY"),
            })
              .then(() => {
                setLoading(false);
                messageApi.open({
                  type: "success",
                  content: "Update berhasil.",
                });
                fetchUser({
                  skip: Math.max(0, (currentPage - 1) * 100),
                  take: 100,
                });
              })
              .catch((e) => {
                setLoading(false);
                messageApi.open({
                  type: "error",
                  content: e.message,
                });
              });
          }}
          autoComplete="off"
        >
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
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
              <Button loading={loading} type="primary" htmlType="submit" block>
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
        }}
        footer={null}
        destroyOnClose={true}
      >
        <div className="h-[300px] overflow-auto p-2">
          <Form
            preserve={false}
            name="roles"
            layout="vertical"
            labelCol={{ span: 16 }}
            wrapperCol={{ span: 24 }}
            onFinish={(value) => {
              addRoles({
                idRole: value.roles,
                id: session?.user?.id as string,
                idEdit: idEdit,
              })
                .then((value) => {
                  setRole((prevRoles) => [
                    ...prevRoles,
                    { id: value.id, name: value.name },
                  ]);
                })
                .catch((e) => {
                  messageApi.open({
                    type: "error",
                    content: e.message,
                  });
                });
            }}
            autoComplete="off"
          >
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
                <Button type="primary" htmlType="submit">
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
                  <a
                    onClick={() => {
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
                        });
                    }}
                    key="list-loadmore-edit"
                  >
                    delete
                  </a>,
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
