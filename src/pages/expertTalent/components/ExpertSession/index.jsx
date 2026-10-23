import { message } from "antd";
import { useEffect } from "react";
import { runClosing } from "../../settlement";
import { getExpertState, updateStore } from "../../store";
import { getExpertConfig } from "../../configStore";

export function checkClosing(manual = false) {
  try {
    const check = structuredClone(getExpertState());
    const ids = runClosing(check, getExpertConfig());
    if (ids.length) {
      updateStore((state) => {
        runClosing(state, getExpertConfig());
      });
      if (manual) message.success(`已补跑归集${ids.length}个月度批次`);
    } else if (manual) message.info("结账检查完成，暂无到期未归集单据");
  } catch (error) {
    if (manual) message.error(error.message);
  }
}
export default function ExpertSession() {
  useEffect(() => {
    checkClosing();
    const timer = window.setInterval(() => checkClosing(), 30000);
    return () => window.clearInterval(timer);
  }, []);
  return null;
}
