"use client";

import Image from "next/image";
import type { FormProps } from "antd";
import moment from "moment/moment.js";
import { Button, ConfigProvider, Form, Input, message } from "antd";
import { login } from "@/controller/action";
import { useRouter } from "next/navigation";

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

export default function Home() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      const resAuth = await login({
        email: values.username as string,
        password: values.password as string,
      });

      if (resAuth) {
        router.replace("/pages/dashboard");
      }
    } catch (error: any) {
      messageApi.open({
        type: "error",
        content: error.message.replace(/Error: /g, ""),
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

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Form
            name="basic"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            className="w-max-[600] gap-5"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item<FieldType>
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
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
                <Button type="primary" htmlType="submit" block>
                  LOGIN
                </Button>
              </ConfigProvider>
            </Form.Item>
          </Form>
        </div>
      </div>

      <footer className="bg-white text-black text-center py-4 text-sm">
        &copy; {moment().format("YYYY")} PT. SAHARA BOGATAMA All rights
        reserved.
      </footer>
    </main>
  );
}
