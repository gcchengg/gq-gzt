import { Fragment } from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { ScrollRestoration } from "react-router-dom";
import AppShell from "@/components/AppShell";

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Fragment>
        <AppShell />
        <ScrollRestoration />
      </Fragment>
    </ConfigProvider>
  );
}
