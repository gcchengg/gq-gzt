export const getUser = async () => ({
  code: 200,
  data: {
    id: "root",
    orgName: "一汽股权",
    disabled: true,
    members: [
      { loginId: "zhangming", fullName: "张明" },
      { loginId: "lina", fullName: "李娜" },
      { loginId: "wanglei", fullName: "王磊" },
    ],
    children: [
      {
        id: "equity-management",
        orgName: "股权管理部",
        disabled: true,
        members: [
          { loginId: "zhaomin", fullName: "赵敏" },
          { loginId: "chenhao", fullName: "陈浩" },
        ],
        children: [],
      },
    ],
  },
});
