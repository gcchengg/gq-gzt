import React, { useState, useEffect } from "react";
import { Card, Button } from "antd";
import Tabs1 from "./Tabs1";
import Tabs2 from "./Tabs2";
import {} from "../api/index";
import "./index.less";

const MedalManager = () => {
  // 控制当前激活的Tab（考试管理/题库维护）
  const [activeTab, setActiveTab] = useState("exam");

  return (
    <div className="medal-manager-page">
      {/* 页面标题区域 */}
      <div className="page-header">
        <h1 className="page-title">勋章管家</h1>
      </div>

      {/* Tab切换按钮 */}
      <div className="tab-buttons">
        <Button
          className={`tab-btn ${activeTab === "exam" ? "primary" : "default"}`}
          onClick={() => setActiveTab("exam")}
        >
          考试管理
        </Button>
        <Button
          className={`tab-btn ${activeTab === "bank" ? "primary" : "default"}`}
          onClick={() => setActiveTab("bank")}
        >
          题库维护
        </Button>
      </div>

      {/* 内容卡片区域 */}
      <Card className="content-card" variant="borderless">
        {/* 考试管理页面 */}
        {activeTab === "exam" && <Tabs1 />}

        {/* 题库维护页面 */}
        {activeTab === "bank" && <Tabs2 />}
      </Card>
    </div>
  );
};

export default MedalManager;
