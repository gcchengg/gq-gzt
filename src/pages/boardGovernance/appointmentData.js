import { directors } from "./mockData.js";

const appointmentState = {
  待上传董事简历: { status: "待上传董事简历", currentStep: 1 },
  待配置系统权限: { status: "待配置系统权限并纳入组织架构", currentStep: 2 },
  待完成工商变更: { status: "待完成工商变更", currentStep: 3 },
  已完成: { status: "已完成", currentStep: 4 },
};

const extraCases = [
  {
    id: "AP-2026-007",
    director: "赵启明",
    directorId: null,
    company: "一汽能源科技",
    position: "外部董事",
    letter: "一汽股董推〔2026〕17号",
    letterFileName: "董事推荐函-赵启明.pdf",
    owner: "综合管理部-办公室 / 阮迪",
    recipient: "综合管理部-人力 / 周航",
    deadline: "09-17 17:00",
    status: "待上传董事简历",
    currentStep: 1,
  },
];

export const initialAppointmentCases = [
  ...extraCases,
  ...directors
    .filter((item) => item.lifecycleStage === "appointment")
    .map((director) => ({
      id: `AP-${director.id}`,
      director: director.name,
      directorId: director.id,
      company: director.company,
      position: director.role,
      letter: `一汽股董推〔2026〕${director.id.slice(2)}号`,
      letterFileName: `董事推荐函-${director.name}.pdf`,
      owner: "综合管理部-办公室 / 阮迪",
      recipient: "综合管理部-人力 / 周航",
      deadline: "09-20 17:00",
      ...(appointmentState[director.appointmentStatus] || {
        status: "待下发董事推荐函",
        currentStep: 0,
      }),
    })),
];
