import React from "react";
import { Button, Layout, theme } from "antd";
import { BsFillMenuButtonFill } from "react-icons/bs";
import { FaSignOutAlt } from "react-icons/fa";
import { logout, testerEmail } from "@/controller/action";
import { RiMailSendLine } from "react-icons/ri";

interface HeaderBarProps {
  onCollapsed: () => void;
}

export default function HeaderBar({ onCollapsed }: HeaderBarProps) {
  const { Header } = Layout;
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Header
      style={{
        padding: 0,
        background: colorBgContainer,
      }}
    >
      <div className="flex justify-between items-center px-4 py-4">
        <Button
          type="text"
          icon={<BsFillMenuButtonFill />}
          onClick={onCollapsed}
        />

        <Button
          type="text"
          icon={<FaSignOutAlt />}
          onClick={() => {
            logout();
          }}
        >
          Logout
        </Button>
      </div>
    </Header>
  );
}
