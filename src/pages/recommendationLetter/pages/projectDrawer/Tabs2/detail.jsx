import React, { useState, useEffect } from "react";
import { getInfo } from "../../../api/index";
import WordDom from "./wordDom";
import { Spin } from "antd";

export default function Detail({ id }) {
  const [loading, setLoading] = useState(true);
  const [infoData, setInfoData] = useState({});
  const getList = () => {
    setLoading(true);
    getInfo(id).then((res) => {
      if (res.code == 200 && res.data) {
        setInfoData(res.data || {});
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    if (id) {
      getList();
    }
  }, [id]);
  return (
    <Spin spinning={loading}>
      <WordDom infoData={infoData} />
    </Spin>
  );
}
