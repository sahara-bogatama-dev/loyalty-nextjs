import React from "react";
import { Layout, Menu, ConfigProvider, Avatar, message } from "antd";
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
import { userRoles } from "@/controller/action";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "next-auth";

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
  const [baseUrl, setBaseUrl] = React.useState("");
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
            key: "MD-3",
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
            key: "INV-1",
            label: "Labeling",
            icon: <FaBarcode />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/labeling-product");
            },
          },
          {
            key: "INV-2",
            label: "Labeling Box",
            icon: <FaBoxesPacking />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/labeling-box");
            },
          },
          {
            key: "INV-3",
            label: "Stock",
            icon: <FaWarehouse />,
            role: ["cm0r2rm2w00000cl8as2u68th"],
            onClick: () => {
              route.push("/pages/stock-product");
            },
          },
        ],
      },
      {
        key: "sub4",
        label: "DITRIBUTION",
        role: ["cm0r2rm2w00000cl8as2u68th"],
        children: [
          {
            key: "DIT-1",
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
            key: "LY-1",
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

          const { protocol, hostname, port } = window.location;
          setBaseUrl(`${protocol}//${hostname}${port ? `:${port}` : ""}`);
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
          src={
            <Image
              src={`${baseUrl}/api/userDetail/image/`}
              alt="avatar"
              width={50}
              height={50}
              unoptimized
            />
          }
        />
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
        }}
      >
        <Menu
          className="bg-red-700"
          mode="inline"
          defaultSelectedKeys={[usePathname()]}
          items={menuList}
        />
      </ConfigProvider>
    </Sider>
  );
}
