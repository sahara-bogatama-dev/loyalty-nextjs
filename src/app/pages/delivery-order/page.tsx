"use client";

import React from "react";
import {
  Layout,
  theme,
  Breadcrumb,
  Form,
  message,
  Tag,
  Modal,
  ConfigProvider,
  Button,
  Row,
  Col,
  Input,
  DatePicker,
  InputNumber,
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import HeaderBar from "@/app/component/header.comp";
import _ from "lodash";
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
  cancelDR,
  downloadDR,
  listDataDelivery,
  listDataDeliveryProduct,
  receivesDR,
  submitPrintDR,
} from "@/controller/deliveryOrder/action";
import { MdCancel, MdCallReceived, MdPrint } from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";
import { RiMailSendFill } from "react-icons/ri";
import {
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { TemplateDR } from "@/app/component/templateDR.comp";
import dayjs from "dayjs";

export default function Home() {
  const { Content } = Layout;
  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingTable, setLoadingTable] = React.useState(false);
  const [loadingModal, setLoadingModal] = React.useState(false);

  const [showProduct, setShowProduct] = React.useState(false);
  const [showReceiveDR, setReceiveDR] = React.useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();

  const [deliveryList, setDeliveryList] = React.useState<any[]>([]);
  const [deliveryProductList, setDeliveryProductList] = React.useState<any[]>(
    []
  );

  const [addForm] = Form.useForm();

  const fetchDelivery = React.useCallback(async () => {
    setLoadingTable(true);
    const data = await listDataDelivery();
    if (data.success) {
      setDeliveryList(data.value);
    } else {
      messageApi.error(data.error);
    }
    setLoadingTable(false);
  }, [messageApi]);

  React.useEffect(() => {
    fetchDelivery();
  }, [fetchDelivery]);

  const downloadsDR = async ({ id }: { id: string }) => {
    setLoadingTable(true);
    const data = await downloadDR({ deliveryOrderId: id });

    if (data.success) {
      const blob = await pdf(
        <TemplateDR
          customerName={data.value?.customerName}
          noOrder={data.value?.orderNo}
          noSurat={data.value?.noSurat}
          shipDate={dayjs(data.value?.shippingDate).format("DD/MM/YYYY")}
          totalWeight={String(data.value?.totalWeight)}
          customerAddress={data.value?.deliveryAddress}
          itemDesc={_.map(data.value?.deliveryOrderProduct, (o) => ({
            productName: o.productName,
            qty: o.shipQty,
            unit: o.unit,
          }))}
          note={data.value?.deliveryNote ?? ""}
        />
      ).toBlob();
      saveAs(blob, data.value?.noSurat);
      setLoadingTable(false);
    } else {
      messageApi.error(data.error);
    }
  };

  const submitsDR = async ({ id }: { id: string }) => {
    setLoadingTable(true);
    const data = await submitPrintDR({
      deliveryOrderId: id,
      updatedBy: session?.user?.name ?? "",
    });

    if (data.success) {
      const blob = await pdf(
        <TemplateDR
          customerName={data.value?.customerName}
          noOrder={data.value?.orderNo}
          noSurat={data.value?.noSurat}
          shipDate={dayjs(data.value?.shippingDate).format("DD/MM/YYYY")}
          totalWeight={String(data.value?.totalWeight)}
          customerAddress={data.value?.deliveryAddress}
          itemDesc={_.map(data.value?.deliveryOrderProduct, (o) => ({
            productName: o.productName,
            qty: o.shipQty,
            unit: o.unit,
          }))}
          note={data.value?.deliveryNote ?? ""}
        />
      ).toBlob();
      saveAs(blob, data.value?.noSurat);

      setDeliveryList((prev) =>
        prev.map((row) =>
          row.deliveryOrderId === data.value.deliveryOrderId
            ? {
                ...row,
                status: "On Delivery - DR",
                statusColor: "saddlebrown",
                statusCode: 8,
                updatedAt: dayjs().toDate(),
                updatedBy: session?.user?.name ?? "",
              }
            : row
        )
      );
      setLoadingTable(false);
    } else {
      messageApi.error(data.error);
    }
  };

  const cancelsDR = async ({ id }: { id: string }) => {
    setLoadingTable(true);
    const data = await cancelDR({
      deliveryOrderId: id,
      updatedBy: session?.user?.name ?? "",
    });

    if (data.success) {
      setDeliveryList((prev) =>
        prev.map((row) =>
          row.deliveryOrderId === id
            ? {
                ...row,
                status: "Canceled - DR",
                statusColor: "lavender",
                statusCode: 10,
                updatedAt: dayjs().toDate(),
                updatedBy: session?.user?.name ?? "",
              }
            : row
        )
      );
      setLoadingTable(false);
    } else {
      messageApi.error(data.error);
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
              { title: "List Delivery Order", href: "/pages/delivery-order" },
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
                rows={deliveryList}
                disableRowSelectionOnClick
                headerFilters
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 1000, page: 0 },
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
                getRowId={(row) => row.deliveryOrderId}
                columns={[
                  {
                    field: "actions",
                    type: "actions",
                    headerName: "Actions",
                    width: 100,
                    cellClassName: "actions",
                    getActions: ({ id, row }) => {
                      const actions = [
                        // "Open DR" is always shown
                        <GridActionsCellItem
                          key={`open-${id}`}
                          icon={<FaBoxOpen />}
                          label="Open DR"
                          className="textPrimary"
                          color="inherit"
                          showInMenu
                          onClick={async () => {
                            setShowProduct(true);
                            setLoadingModal(true);

                            const data = await listDataDeliveryProduct({
                              deliveryOrderId: id.toString(),
                            });

                            if (data.success) {
                              setDeliveryProductList(data.value);
                            } else {
                              messageApi.error(data.error);
                            }
                            setLoadingModal(false);
                          }}
                        />,
                      ];

                      // Show "Submit DR" and "Cancel DR" if status is 7
                      if (row.statusCode === 7) {
                        actions.push(
                          <GridActionsCellItem
                            key={`cancel-${id}`}
                            icon={<MdCancel />}
                            label="Cancel DR"
                            className="textPrimary"
                            color="inherit"
                            showInMenu
                            onClick={() => {
                              cancelsDR({ id: id.toString() });
                            }}
                          />,
                          <GridActionsCellItem
                            key={`submit-${id}`}
                            icon={<RiMailSendFill />}
                            label="Submit DR"
                            className="textPrimary"
                            color="inherit"
                            showInMenu
                            onClick={() => {
                              submitsDR({ id: id.toString() });
                            }}
                          />
                        );
                      }

                      // Show "Receive" if status is 8
                      if (row.statusCode === 8) {
                        actions.push(
                          <GridActionsCellItem
                            key={`receive-${id}`}
                            icon={<MdCallReceived />}
                            label="Receive"
                            className="textPrimary"
                            color="inherit"
                            showInMenu
                            onClick={async () => {
                              setReceiveDR(true);
                              setLoadingModal(true);

                              const data = await listDataDeliveryProduct({
                                deliveryOrderId: id.toString(),
                              });

                              if (data.success) {
                                addForm.setFieldsValue({
                                  orderId: id.toString(),
                                  products: _.map(data.value, (o) => ({
                                    deliveryOrderProductId:
                                      o.deliveryOrderProductId,
                                    labelingBox: o.labelingBox,
                                    shipQty: o.shipQty,
                                    receivedQty: o.receivedQty,
                                  })),
                                });
                              } else {
                                messageApi.error(data.error);
                              }
                              setLoadingModal(false);
                            }}
                          />
                        );

                        actions.push(
                          <GridActionsCellItem
                            key={`print-${id}`}
                            icon={<MdPrint />}
                            label="Print DR"
                            className="textPrimary"
                            color="inherit"
                            showInMenu
                            onClick={async () => {
                              downloadsDR({
                                id: id.toString(),
                              });
                            }}
                          />
                        );
                      }

                      return actions;
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
                    field: "noSurat",
                    headerName: "No Surat",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "orderNo",
                    headerName: "Order No",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "shippingDate",
                    headerName: "Shipping Date",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "deliveryAddress",
                    headerName: "Delivery Address",
                    width: 250,
                    type: "string",
                    editable: false,
                  },
                  {
                    field: "receiveBy",
                    headerName: "Receive By",
                    width: 250,
                    type: "date",
                    editable: false,
                  },
                  {
                    field: "receiveNote",
                    headerName: "Receive Note",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "receiveDate",
                    headerName: "Receive Date",
                    headerAlign: "center",
                    minWidth: 250,
                    editable: false,
                    type: "dateTime",
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
            title={"Receive DR"}
            footer={null}
            loading={loadingModal}
            open={showReceiveDR}
            onCancel={() => setReceiveDR(false)}
            destroyOnClose
          >
            <Form
              name="receiveDR"
              className="gap-10"
              form={addForm}
              onFinish={async (value) => {
                try {
                  setLoading(true);

                  const receive = await receivesDR({
                    deliveryOrderId: value.orderId,
                    receiveDate: value.receiveDate,
                    receiveBy: value.receiveBy,
                    receiveNote: value.receiveNote,
                    dataQty: _.map(value.products, (o) => ({
                      deliveryOrderProductId: o.deliveryOrderProductId,
                      receivedQty: o.receivedQty,
                    })),
                    updatedBy: session?.user?.name ?? "",
                  });

                  if (receive.success) {
                    setReceiveDR(false);
                    setDeliveryList((prev) =>
                      prev.map((row) =>
                        row.deliveryOrderId === value.orderId
                          ? {
                              ...row,
                              status: "Receive - DR",
                              statusColor: "royalblue",
                              statusCode: 9,
                              updatedAt: dayjs().toDate(),
                              updatedBy: session?.user?.name ?? "",
                            }
                          : row
                      )
                    );
                    messageApi.success("DR berhasil direceive.");
                  } else {
                    messageApi.error(receive.error);
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
              layout="vertical"
            >
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Form.Item name="orderId" hidden>
                  <Input />
                </Form.Item>
                <Col className="gutter-row" xs={8} sm={8} md={8} lg={8} xl={8}>
                  <Form.Item
                    label="Receive Date"
                    name="receiveDate"
                    rules={[
                      {
                        required: true,
                        message: "Please input your date!",
                      },
                    ]}
                  >
                    <DatePicker className="w-full" />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" xs={8} sm={8} md={8} lg={8} xl={8}>
                  <Form.Item
                    label="Receive By"
                    name="receiveBy"
                    rules={[
                      {
                        required: true,
                        message: "Please input your fullname!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" xs={8} sm={8} md={8} lg={8} xl={8}>
                  <Form.Item
                    label="Receive Note"
                    name="receiveNote"
                    rules={[
                      {
                        required: true,
                        message: "Please input your fullname!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.List name="products">
                {(fields) =>
                  fields.map(({ key, name }) => (
                    <Row key={key} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                      <Form.Item name={[name, "deliveryOrderProductId"]} hidden>
                        <Input />
                      </Form.Item>

                      <Col
                        className="gutter-row"
                        xs={8}
                        sm={8}
                        md={8}
                        lg={8}
                        xl={8}
                      >
                        <Form.Item
                          label="Labeling Box"
                          name={[name, "labelingBox"]}
                        >
                          <Input readOnly />
                        </Form.Item>
                      </Col>

                      <Col
                        className="gutter-row"
                        xs={8}
                        sm={8}
                        md={8}
                        lg={8}
                        xl={8}
                      >
                        <Form.Item label="Ship Qty" name={[name, "shipQty"]}>
                          <InputNumber readOnly className="w-full" />
                        </Form.Item>
                      </Col>

                      <Col
                        className="gutter-row"
                        xs={8}
                        sm={8}
                        md={8}
                        lg={8}
                        xl={8}
                      >
                        <Form.Item
                          label="Receive Qty"
                          name={[name, "receivedQty"]}
                          rules={[
                            {
                              required: true,
                              message: "Please input received quantity!",
                            },
                          ]}
                        >
                          <InputNumber className="w-full" />
                        </Form.Item>
                      </Col>
                    </Row>
                  ))
                }
              </Form.List>

              <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                <ConfigProvider theme={{ token: { colorPrimary: "red" } }}>
                  <Button
                    loading={loading}
                    type="primary"
                    htmlType="submit"
                    block
                  >
                    Receive DR
                  </Button>
                </ConfigProvider>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={"List Product DR"}
            footer={null}
            open={showProduct}
            onCancel={() => setShowProduct(false)}
            destroyOnClose
            loading={loadingModal}
          >
            <div style={{ height: 500, width: "100%", marginTop: 10 }}>
              <DataGridPremium
                loading={loadingTable}
                pageSizeOptions={[10, 100, 1000]}
                rows={deliveryProductList}
                disableRowSelectionOnClick
                headerFilters
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 1000, page: 0 },
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
                getRowId={(row) => row.deliveryOrderProductId}
                columns={[
                  {
                    field: "labelingBox",
                    headerName: "Labeling Box",
                    width: 250,
                    editable: false,
                  },
                  {
                    field: "recaivedQty",
                    headerName: "ReceivedQty",
                    width: 250,
                    editable: false,
                    type: "number",
                  },
                  {
                    field: "statusProduct",
                    headerName: "Status Product",
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
