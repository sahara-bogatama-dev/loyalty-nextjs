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
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import {
  addCampaigns,
  allDataCampaign,
  changeImageCampaign,
  currentProducts,
  deleteCampaigns,
  listProducts,
  updateCampaigns,
  updateProductCampaign,
} from "@/controller/campaign/action";
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
import { MdAddPhotoAlternate, MdCancel, MdPhoto } from "react-icons/md";
import { RcFile, UploadProps } from "antd/es/upload";
import getBase64 from "@/lib/arrayBufferToBase64";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { FaBoxOpen, FaEdit, FaInbox, FaSave } from "react-icons/fa";
import dayjs from "dayjs";
import { FaFileImage, FaTrashCan } from "react-icons/fa6";

export default function Home() {
  const { Content } = Layout;
  const { RangePicker } = DatePicker;
  const { Dragger } = Upload;

  const [baseUrl, setBaseUrl] = React.useState("");

  const [addForm] = Form.useForm();

  const [productForm] = Form.useForm();

  const [collapsed, setCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingModalProduct, setLoadingModalProduct] = React.useState(false);

  const [openImage, setOpenImage] = React.useState(false);

  const [openProduct, setOpenProduct] = React.useState(false);

  const [campaignId, setCammpaignId] = React.useState("");

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [campaignList, setCampaignList] = React.useState<any[]>([]);
  const [productList, setProductList] = React.useState<any[]>([]);
  const [loadingTable, setLoadingTable] = React.useState(false);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const [listEditProduct, setListEditProduct] = React.useState<any[]>([]);
  const [productOldList, setProductOldList] = React.useState<any[]>([]);

  const fetchCampaign = React.useCallback(async () => {
    setLoadingTable(true);
    const campaign = await allDataCampaign();
    if (campaign.success) {
      setCampaignList(campaign.value.result as any);
    } else {
      messageApi.open({
        type: "error",
        content: campaign.error,
      });
    }
    setLoadingTable(false);
  }, [messageApi]);

  const fetchProduct = React.useCallback(async () => {
    const units = await listProducts();

    if (units.success) {
      setProductList(units.value);
    } else {
      messageApi.open({
        type: "error",
        content: units.error,
      });
    }
  }, [messageApi]);

  React.useEffect(() => {
    fetchCampaign();
    fetchProduct();

    const { protocol, hostname, port } = window.location;
    setBaseUrl(`${protocol}//${hostname}${port ? `:${port}` : ""}`);
  }, [fetchCampaign, fetchProduct]);

  const validateFile = async (file: RcFile) => {
    const maxSize = 500 * 1024;
    const maxWidth = 864;
    const maxHeight = 400;

    return new Promise<void>((resolve, reject) => {
      if (file.size > maxSize) {
        reject("File size must be smaller than 500KB!");
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (img.width !== maxWidth && img.height !== maxHeight) {
          reject("Image dimensions must not exceed 864x400 pixels!");
        } else {
          resolve();
        }
      };
      img.onerror = () => {
        reject("Invalid image file!");
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.onerror = () => {
        reject("Error reading file!");
      };
      reader.readAsDataURL(file);
    });
  };

  const validateUpload = (rule: any, value: any) => {
    if (!value || value.fileList.length === 0) {
      return Promise.reject("Please upload an image!");
    }

    return validateFile(value.fileList[0].originFileObj)
      .then(() => Promise.resolve())
      .catch((error) => Promise.reject(error));
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleDeleteClick = (id: GridRowId) => async () => {
    const deleteCampaign = await deleteCampaigns({ campaignId: id.toString() });

    if (deleteCampaign.success) {
      setCampaignList(campaignList.filter((row) => row.campaignId !== id));
    } else {
      messageApi.open({
        type: "error",
        content: deleteCampaign.error,
      });
    }
  };

  const handleImageClick = (id: GridRowId) => () => {
    setOpenImage(true);
    setCammpaignId(id.toString());
  };

  const handleProductClick = (id: GridRowId) => async () => {
    setOpenProduct(true);
    setLoadingModalProduct(true);

    fetchProduct().finally(async () => {
      const productCampaign = await currentProducts({
        campaignId: id.toString(),
      });

      if (productCampaign.success) {
        setListEditProduct(_.concat(productList, productCampaign.value));
        setProductOldList(productCampaign.value);

        productForm.setFieldsValue({
          selectProduct: productCampaign.value,
          campaignId: id.toString(),
        });
      } else {
        messageApi.open({
          type: "error",
          content: productCampaign.error,
        });
      }

      setLoadingModalProduct(false);
    });
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
    const updateRow = await updateCampaigns({
      campaignId: newRow.campaignId,
      campaignName: newRow.campaignName,
      startDate: newRow.startDate,
      endDate: newRow.endDate,
      loyaltyPoint: newRow.loyaltyPoint,
      description: newRow.description,
      inActive: newRow.inActive,
      updatedBy: session?.user?.name ?? "",
    });

    if (updateRow.success) {
      setCampaignList((prevRows) =>
        prevRows.map((row) =>
          row.campaignId === newRow.campaignId
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
        [newRow.campaignId]: {
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

  const props: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept: ".jpeg,.jpg",
    beforeUpload(file) {
      const maxSize = 500 * 1024;
      const maxWidth = 864;
      const maxHeight = 400;

      return new Promise<void>((resolve, reject) => {
        if (file.size > maxSize) {
          messageApi.open({
            type: "error",
            content: "File size must be smaller than 500KB!",
          });

          return Upload.LIST_IGNORE;
        }

        const img = new Image();
        img.onload = () => {
          if (img.width !== maxWidth && img.height !== maxHeight) {
            messageApi.open({
              type: "error",
              content: "Image dimensions must not exceed 864x400 pixels!",
            });
            reject("Image dimensions must not exceed 864x400 pixels!");
          } else {
            resolve();
          }
        };
        img.onerror = () => {
          reject("Invalid image file!");
        };

        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            img.src = e.target.result as string;
          }
        };
        reader.onerror = () => {
          reject("Error reading file!");
        };
        reader.readAsDataURL(file);
      });
    },
    async onChange(info) {
      const { status, originFileObj } = info.file;

      if (status === "done") {
        const base64 = (await getBase64(originFileObj as RcFile)) as string;

        const uploadIMG = await changeImageCampaign({
          campaignId: campaignId,
          image: base64.replace(/^data:image\/[a-z]+;base64,/, ""),
          updatedBy: session?.user?.name ?? "",
        });
        if (uploadIMG.success) {
          messageApi.success("Upload complete.");
        } else {
          messageApi.error(uploadIMG.error);
        }
      } else if (status === "error") {
        messageApi.open({
          type: "error",
          content: "Image upload failed.",
        });
      }
    },
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
              { title: "Campaign", href: "/pages/campaign" },
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
              <Card size="small" title="Buat Campaign" bordered={true}>
                <Form
                  name="addCampaign"
                  className="gap-10"
                  form={addForm}
                  onFinish={async (value) => {
                    try {
                      const base64 = (await getBase64(
                        value.addImg.file
                      )) as string;

                      setLoading(true);

                      const createdCampaign = await addCampaigns({
                        campaignName: value.campaignName,
                        startDate: dayjs(value.dateRange[0]).toISOString(),
                        endDate: dayjs(value.dateRange[1]).toISOString(),
                        productId: value.selectProduct,
                        description: value.desc,
                        loyaltyPoint: value.point,
                        createdBy: session?.user?.name ?? "",
                        image: base64.replace(
                          /^data:image\/[a-z]+;base64,/,
                          ""
                        ),
                      });

                      if (createdCampaign.success) {
                        messageApi.open({
                          type: "success",
                          content: "Campaign sudah ditambahkan.",
                        });

                        addForm.resetFields();
                        fetchCampaign();
                        fetchProduct();
                      } else {
                        messageApi.open({
                          type: "error",
                          content: createdCampaign.error,
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
                        label="Campaign Name"
                        name="campaignName"
                        rules={[
                          {
                            required: true,
                            message: "Please input your Campaign name!",
                          },
                          {
                            max: 255,
                            message: "Max length Campaign name!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Range Date"
                        name="dateRange"
                        rules={[
                          {
                            required: true,
                            message: "Please input your start date!",
                          },
                        ]}
                      >
                        <RangePicker format={"DD/MM/YYYY"} className="w-full" />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Select Product"
                        name="selectProduct"
                        rules={[
                          {
                            required: true,
                            message: "Please input your product!",
                          },
                        ]}
                      >
                        <Select
                          mode="multiple"
                          allowClear
                          options={_.map(productList, (o) => ({
                            value: o.value,
                            label: <span>{o.label}</span>,
                          }))}
                          virtual={false}
                        />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Point"
                        name="point"
                        rules={[
                          {
                            required: true,
                            message: "Please input your expired period!",
                          },
                        ]}
                      >
                        <InputNumber addonAfter="Point" className="w-full" />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Description"
                        name="desc"
                        rules={[
                          {
                            required: true,
                            message: "Please input your description!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" xs={24} md={12} xl={8}>
                      <Form.Item
                        label="Upload Image"
                        name="addImg"
                        rules={[
                          {
                            validator: validateUpload,
                          },
                        ]}
                      >
                        <Upload
                          listType="picture-card"
                          multiple={false}
                          accept=".jpeg,.jpg"
                          beforeUpload={(file) => {
                            validateFile(file).catch(() => false);
                            return false;
                          }}
                          maxCount={1}
                        >
                          <button
                            style={{
                              border: 0,
                              background: "none",
                            }}
                            type="button"
                          >
                            <MdAddPhotoAlternate className="text-3xl" />
                            <div style={{ marginTop: 8 }}>Upload</div>
                          </button>
                        </Upload>
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
                        Add Campaign
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
                    paginationModel: { pageSize: 100, page: 0 },
                  },
                }}
                rowSelection={false}
                rows={campaignList}
                getRowId={(row) => row.campaignId}
                columnGroupingModel={[
                  {
                    groupId: "durationCampaign",
                    headerName: "Campaign Duration",
                    headerAlign: "center",
                    children: [{ field: "startDate" }, { field: "endDate" }],
                  },
                ]}
                columns={[
                  {
                    field: "actions",
                    type: "actions",
                    headerName: "Actions",
                    width: 250,
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
                          icon={<FaFileImage />}
                          label="Edit Image"
                          className="textPrimary"
                          color="inherit"
                          onClick={handleImageClick(id)}
                        />,
                        <GridActionsCellItem
                          key={id.toString()}
                          icon={<FaBoxOpen />}
                          label="Product"
                          className="textPrimary"
                          color="inherit"
                          onClick={handleProductClick(id)}
                        />,
                        <GridActionsCellItem
                          key={id.toString()}
                          icon={<FaTrashCan />}
                          label="Delete"
                          className="textPrimary"
                          color="inherit"
                          onClick={handleDeleteClick(id)}
                        />,
                      ];
                    },
                  },
                  {
                    field: "inActive",
                    headerName: "InActive",
                    type: "boolean",
                    width: 120,
                    editable: true,
                  },
                  {
                    field: "campaignName",
                    headerName: "Nama Campaign",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "startDate",
                    headerName: "Start Date",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                    type: "dateTime",
                  },
                  {
                    field: "endDate",
                    headerName: "End Date",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                    type: "dateTime",
                  },
                  {
                    field: "loyaltyPoint",
                    headerName: "Point",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "description",
                    headerName: "Description",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: true,
                  },
                  {
                    field: "photo",
                    headerName: "Image",
                    type: "actions",
                    minWidth: 250,
                    headerAlign: "center",
                    editable: false,
                    align: "center",
                    getActions: ({ id }) => [
                      <PhotoProvider key={id} className="text-xs">
                        <PhotoView
                          src={`${baseUrl}/api/campaign/image/${id.toString()}`}
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

            <Modal
              title={"Edit Image"}
              footer={null}
              open={openImage}
              onCancel={() => setOpenImage(false)}
              destroyOnClose
            >
              <Dragger {...props}>
                <p className="text-2xl text-center flex items-center justify-center">
                  <FaInbox />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single. Strictly prohibited from uploading
                  company data or other banned files.
                </p>
              </Dragger>
            </Modal>

            <Modal
              title={"Edit product campaign"}
              footer={null}
              open={openProduct}
              onCancel={() => setOpenProduct(false)}
              destroyOnClose
              loading={loadingModalProduct}
            >
              <Form
                name="updateProduct"
                className="gap-10"
                form={productForm}
                onFinish={async (value) => {
                  try {
                    setLoading(true);
                    const updateProd = await updateProductCampaign({
                      campaignId: value.campaignId,
                      productId: value.selectProduct,
                      oldProductId: _.difference(
                        _.map(productOldList, (o) => {
                          return o.value;
                        }),
                        value.selectProduct
                      ),
                      updatedBy: session?.user?.name ?? "",
                    });

                    if (updateProd.success) {
                      messageApi.success("Update product berhasil.");
                    } else {
                      messageApi.success(updateProd.error);
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
                <Form.Item name="campaignId" hidden>
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Select Product"
                  name="selectProduct"
                  rules={[
                    {
                      required: true,
                      message: "Please input your product!",
                    },
                  ]}
                >
                  <Select
                    className="w-full"
                    mode="multiple"
                    allowClear
                    options={_.map(listEditProduct, (o) => ({
                      value: o.value,
                      label: <span>{o.label}</span>,
                    }))}
                    virtual={false}
                  />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                  <ConfigProvider theme={{ token: { colorPrimary: "red" } }}>
                    <Button
                      loading={loading}
                      type="primary"
                      htmlType="submit"
                      block
                    >
                      Update Product
                    </Button>
                  </ConfigProvider>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
