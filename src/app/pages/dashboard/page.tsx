"use client";

import React, { useState } from "react";
import {
  Layout,
  theme,
  Breadcrumb,
  message,
  Card,
  Row,
  Col,
  Image,
} from "antd";
import SideBar from "@/app/component/side.comp";
import { useSession } from "next-auth/react";
import HeaderBar from "@/app/component/header.comp";

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { listCampaignActives } from "@/controller/action";
import _ from "lodash";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const { Content } = Layout;

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [baseUrl, setBaseUrl] = React.useState("");

  const [loadingCampaign, setLoadingCampaign] = React.useState(false);
  const [activeCampaign, setActiveCampaign] = React.useState<any>([]);

  const fetchCampaign = React.useCallback(async () => {
    setLoadingCampaign(true);
    const campaign = await listCampaignActives();

    if (campaign.success) {
      setActiveCampaign(campaign.value);
    } else {
      messageApi.open({
        type: "error",
        content: campaign.error,
      });
    }
  }, [messageApi]);

  React.useEffect(() => {
    const { protocol, hostname, port } = window.location;
    setBaseUrl(`${protocol}//${hostname}${port ? `:${port}` : ""}`);

    fetchCampaign().finally(() => {
      setLoadingCampaign(false);
    });
  }, [fetchCampaign]);

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
              { title: "Dashboard", href: "/pages/dashboard" },
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
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} sm={24} md={24} xl={12}>
                <Card
                  title="Active Campaign"
                  loading={loadingCampaign}
                  style={{ width: "100%" }}
                >
                  <Carousel autoPlay dynamicHeight showThumbs={false}>
                    {_.map(activeCampaign, (o) => {
                      return (
                        <div>
                          <Image
                            src={`${baseUrl}/api/campaign/image/${o.campaignId}`}
                            alt={o.campaignName}
                            preview={false}
                          />

                          <p className="legend">{o.description}</p>
                        </div>
                      );
                    })}
                  </Carousel>
                </Card>
              </Col>
              <Col xs={24} sm={24} md={24} xl={12}>
                <Card
                  title="Top 10 Point"
                  loading={loadingCampaign}
                  style={{ width: "100%" }}
                >
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={[
                        { nama: "Alice", point: 1000 },
                        { nama: "Bob", point: 400 },
                        { nama: "Charlie", point: 150 },
                        { nama: "David", point: 88 },
                        { nama: "Eva", point: 60 },
                        { nama: "Frank", point: 30 },
                        { nama: "Grace", point: 22 },
                        { nama: "Henry", point: 5 },
                        { nama: "Ivy", point: 2 },
                        { nama: "Jack", point: 1 },
                      ]}
                    >
                      <XAxis dataKey="nama" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="point" fill="red" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
