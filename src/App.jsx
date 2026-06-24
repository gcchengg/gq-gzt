import { Fragment } from "react";
import { ScrollRestoration } from "react-router-dom";
import AppShell from "@/components/AppShell";

export default function App() {
    return (<Fragment>
      <AppShell />
      <ScrollRestoration />
    </Fragment>);
}
