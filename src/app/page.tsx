"use client";

import React from "react";
import Image from "next/image";
import type { FormProps } from "antd";
import moment from "moment/moment.js";
import {
  Button,
  ConfigProvider,
  Divider,
  Form,
  Input,
  message,
  Modal,
} from "antd";
import { login } from "@/controller/action";
import { useRouter } from "next/navigation";
import { forgotUser } from "@/controller/register/action";

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

export default function Home() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = React.useState(false);
  const [loadingForgot, setLoadingForgot] = React.useState(false);
  const [modalForgot, setModalForgot] = React.useState(false);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setLoading(true);
    const resAuth = await login({
      email: values.username as string,
      password: values.password as string,
    });

    if (resAuth.success) {
      setLoading(false);
      router.replace("/pages/dashboard");
    } else {
      setLoading(false);
      messageApi.open({
        type: "error",
        content: resAuth.error.replace(/Error: /g, ""),
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col justify-between p-24">
      {contextHolder}
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Image
            className="mx-auto"
            src={"/image/logo.png"}
            alt="Logo Sahara"
            width={75}
            height={75}
            quality={100}
          />

          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
          <Form
            name="basic"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            className="w-max-[600] gap-5"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item<FieldType>
              label="Email"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                  type: "email",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item<FieldType>
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
              <ConfigProvider theme={{ token: { colorPrimary: "red" } }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                >
                  LOGIN
                </Button>
              </ConfigProvider>
            </Form.Item>

            <Divider style={{ borderColor: "#7cb305" }}> OR </Divider>

            <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
              <ConfigProvider theme={{ token: { colorPrimary: "red" } }}>
                <Button
                  type="primary"
                  htmlType="button"
                  onClick={() => {
                    setModalForgot(true);
                  }}
                  block
                >
                  FORGOT PASSWORD
                </Button>
              </ConfigProvider>
            </Form.Item>
          </Form>
        </div>
      </div>

      <Modal
        title={"Forgot Password"}
        footer={null}
        open={modalForgot}
        onCancel={() => setModalForgot(false)}
        destroyOnClose
      >
        <Form
          name="updateProduct"
          className="gap-10"
          onFinish={async (value) => {
            try {
              setLoadingForgot(true);

              const forgotPass = await forgotUser({ email: value.email });

              if (forgotPass.success) {
                setLoadingForgot(false);
                messageApi.success(
                  "Temporary password will be sent to your email."
                );
              } else {
                setLoadingForgot(false);
                messageApi.open({
                  type: "error",
                  content: forgotPass.error,
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
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
                type: "email",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
            <Button
              loading={loadingForgot}
              type="primary"
              htmlType="submit"
              block
            >
              Send to Email
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <footer className="bg-white text-black text-center py-4 text-sm">
        &copy; {moment().format("YYYY")} PT. SAHARA BOGATAMA All rights
        reserved.
      </footer>
    </main>
  );
}
