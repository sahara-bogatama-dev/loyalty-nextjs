import React from "react";
import {
  Layout,
  Menu,
  ConfigProvider,
  Avatar,
  message,
  Modal,
  Form,
  Button,
  Input,
} from "antd";
import _ from "lodash";

import { AiFillDashboard } from "react-icons/ai";
import {
  FaBoxArchive,
  FaHouseUser,
  FaStore,
  FaUserPen,
  FaBarcode,
  FaBoxesPacking,
  FaWarehouse,
  FaCoins,
  FaGift,
} from "react-icons/fa6";
import { MdCampaign, MdOutlineRedeem, MdDeliveryDining } from "react-icons/md";
import { userRoles } from "@/controller/listUser/action";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "next-auth";
import { PiPasswordFill } from "react-icons/pi";
import { changePasswords } from "@/controller/register/action";

interface SideBarProps {
  collapsed: boolean;
  onBreakpoint: (broken: boolean) => void;
  session: Session | null;
}

interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  role?: string[];
  children?: MenuItem[];
  onClick?: () => void;
}

const filterMenuByRole = (menu: MenuItem[], roles: string[]): MenuItem[] => {
  return _.filter(menu, (item) => {
    // Check if the item has a matching role or no role (role is undefined)
    const hasRole =
      _.some(item.role, (role) => _.includes(roles, role)) ||
      item.role === undefined;

    // If the item has children, filter them recursively
    let children = item.children
      ? filterMenuByRole(item.children, roles)
      : undefined;

    // Return the item without the `role` property
    if (hasRole || (children && children.length > 0)) {
      const { role, ...filteredItem } = item;
      return { ...filteredItem, children };
    }

    return null;
  }).filter(Boolean) as MenuItem[];
};

export default function SideBar({
  collapsed,
  onBreakpoint,
  session,
}: SideBarProps) {
  const { Sider } = Layout;
  const [menuList, setMenuList] = React.useState<MenuItem[]>([]);
  const [modalPass, setModalPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const route = useRouter();

  const defaultMenu = React.useMemo<MenuItem[]>(
    () => [
      {
        key: "/pages/dashboard",
        label: "Dashboard",
        icon: <AiFillDashboard />,
        role: undefined,
        onClick: () => {
          route.push("/pages/dashboard");
        },
      },
      {
        key: "sub2",
        label: "MASTER DATA",
        role: ["cm0r2rm2w00000cl8as2u68th"],
        children: [
          {
            key: "/pages/product",
            label: "Product",
            icon: <FaBoxArchive />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/product");
            },
          },
          {
            key: "/pages/agent",
            label: "Agent",
            icon: <FaHouseUser />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/agent");
            },
          },
          {
            key: "/pages/owner-booth",
            label: "Owner Booth",
            icon: <FaStore />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/owner-booth");
            },
          },
          {
            key: "/pages/list-user",
            label: "All User",
            icon: <FaUserPen />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/list-user");
            },
          },
          {
            key: "/pages/campaign",
            label: "Campaign",
            icon: <MdCampaign />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/campaign");
            },
          },
          {
            key: "/pages/package-redeem",
            label: "Package Redeem",
            icon: <MdOutlineRedeem />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/package-redeem");
            },
          },
        ],
      },
      {
        key: "sub3",
        label: "INVENTORY",
        role: ["cm0r2rm2w00000cl8as2u68th"],
        children: [
          {
            key: "/pages/labeling-product",
            label: "Labeling",
            icon: <FaBarcode />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/labeling-product");
            },
          },
          {
            key: "/pages/labeling-box",
            label: "Labeling Box",
            icon: <FaBoxesPacking />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/labeling-box");
            },
          },
          {
            key: "/pages/stock",
            label: "Stock",
            icon: <FaWarehouse />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/stock");
            },
          },
        ],
      },
      {
        key: "sub4",
        label: "DISTRIBUTION",
        role: ["cm0r2rm2w00000cl8as2u68th"],
        children: [
          {
            key: "/pages/delivery-order",
            label: "Delivery Order",
            icon: <MdDeliveryDining />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/delivery-order");
            },
          },
        ],
      },
      {
        key: "sub5",
        label: "LOYALTY",
        role: ["cm0r2rm2w00000cl8as2u68th"],
        children: [
          {
            key: "/pages/point",
            label: "Point",
            icon: <FaCoins />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/point");
            },
          },
          {
            key: "LY-2",
            label: "Claim",
            icon: <FaGift />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/claim-redeem");
            },
          },
        ],
      },
      {
        key: "sub6",
        label: "SETTING ACCOUNT",
        children: [
          {
            key: "/pages/Password",
            label: "Reset Password",
            icon: <PiPasswordFill />,
            onClick: () => {
              setModalPass(true);
            },
          },
        ],
      },
    ],
    [route]
  );

  React.useEffect(() => {
    const setMenu = async () => {
      try {
        if (session) {
          const roles = await userRoles({ id: session?.user?.id as string });

          if (roles.success) {
            const arrayRoles = _.map(roles.value, "role");
            const filtered = filterMenuByRole(defaultMenu, arrayRoles);
            setMenuList(filtered);
          } else {
            messageApi.open({
              type: "error",
              content: roles.error,
            });
          }
        }
      } catch (e: any) {
        messageApi.open({
          type: "error",
          content: e.message,
        });
      }
    };

    setMenu();
  }, [defaultMenu, messageApi, session, session?.user]);

  return (
    <Sider
      style={{
        overflow: "auto",
        height: "100vh",

        scrollbarWidth: "thin",
        scrollbarColor: "unset",
      }}
      className="!bg-red-700"
      breakpoint="xs"
      width={250}
      collapsedWidth="0"
      onBreakpoint={(broken) => onBreakpoint(broken)}
      collapsed={collapsed}
    >
      {contextHolder}
      <div className="m-2 rounded-md bg-white p-3 flex flex-row gap-2  items-center">
        <Avatar
          size="large"
          gap={10}
          style={{ backgroundColor: "red", verticalAlign: "middle" }}
        >
          {session?.user?.name
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()}
        </Avatar>
        <span className="text-black text-xs">{session?.user?.name}</span>
      </div>
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemColor: "white",
              itemSelectedColor: "white",
              itemSelectedBg: "#00000045",
              iconSize: 15,
            },
          },
          token: { colorPrimary: "red" },
        }}
      >
        <Menu
          className="bg-red-700"
          mode="inline"
          defaultSelectedKeys={[usePathname()]}
          items={menuList}
        />

        <Modal
          title={"Change Password"}
          footer={null}
          open={modalPass}
          onCancel={() => setModalPass(false)}
          destroyOnClose
        >
          <Form
            name="updateProduct"
            className="gap-10"
            onFinish={async (value) => {
              try {
                setLoading(true);
                const savePass = await changePasswords({
                  userId: session?.user?.id ?? "",
                  password: value.password,
                  updatedBy: session?.user?.name ?? "",
                });

                if (savePass.success) {
                  setLoading(false);
                  messageApi.success("Password berhasil dirubah.");
                } else {
                  messageApi.open({
                    type: "error",
                    content: savePass.error,
                  });
                }
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
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
              <Button loading={loading} type="primary" htmlType="submit" block>
                Save
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </ConfigProvider>
    </Sider>
  );
}
