import {
  AuditOutlined,
  BankOutlined,
  CrownOutlined,
  FileTextOutlined,
  FundOutlined,
  SolutionOutlined,
  TeamOutlined,
} from "@ant-design/icons";

export const ROLE_KEYS = {
  GROUP_OFFICE: "groupOffice",
  LEADERSHIP: "leadership",
  OFFICE_STRATEGY: "officeStrategy",
  OFFICE_PROFILE: "officeProfile",
  OFFICE_SUPPORT: "officeSupport",
  OFFICE_POLICY: "officePolicy",
  OFFICE_OTHER: "officeOther",
  ADMIN_HR: "adminHr",
  ADMIN_DIGITAL: "adminDigital",
  ADMIN_BOARD: "adminBoard",
  EQUITY: "equity",
  INVESTMENT: "investment",
  AUDIT_LEGAL: "auditLegal",
};

export const ROLE_META = {
  [ROLE_KEYS.GROUP_OFFICE]: {
    label: "集团董办",
    group: "全局角色",
    scope: "全部治理业务",
    description:
      "可配置董事会建设工作台角色，查看集团及子企业全部履职与治理数据。",
    color: "blue",
    icon: CrownOutlined,
  },
  [ROLE_KEYS.LEADERSHIP]: {
    label: "班子成员",
    group: "全局角色",
    scope: "经营决策与督导",
    description: "可查看履职进展、治理监控和重大事项，参与班子会商与决策督导。",
    color: "gold",
    icon: SolutionOutlined,
  },
  [ROLE_KEYS.OFFICE_STRATEGY]: {
    label: "战略规划",
    group: "综合管理部",
    unit: "综合管理部-办公室",
    kind: "category",
    scope: "“531”规划",
    description: "负责履职手册中战略规划类资料更新，当前对应“531”规划。",
    color: "cyan",
    icon: FileTextOutlined,
  },
  [ROLE_KEYS.OFFICE_PROFILE]: {
    label: "公司简介",
    group: "综合管理部",
    unit: "综合管理部-办公室",
    kind: "category",
    scope: "公司基本情况介绍",
    description: "负责履职手册中公司简介类资料更新，当前对应公司基本情况介绍。",
    color: "cyan",
    icon: FileTextOutlined,
  },
  [ROLE_KEYS.OFFICE_SUPPORT]: {
    label: "支撑机制",
    group: "综合管理部",
    unit: "综合管理部-办公室",
    kind: "category",
    scope: "外部董事履职服务支撑机制",
    description:
      "负责履职手册中办公室承担的支撑机制资料，当前对应外部董事履职服务支撑机制。",
    color: "cyan",
    icon: FileTextOutlined,
  },
  [ROLE_KEYS.OFFICE_POLICY]: {
    label: "制度文件",
    group: "综合管理部",
    unit: "综合管理部-办公室",
    kind: "category",
    scope: "公司治理相关制度文件",
    description:
      "负责履职手册中制度文件类资料更新，当前对应公司治理相关制度文件。",
    color: "cyan",
    icon: FileTextOutlined,
  },
  [ROLE_KEYS.OFFICE_OTHER]: {
    label: "其他",
    group: "综合管理部",
    unit: "综合管理部-办公室",
    kind: "category",
    scope: "其他资料",
    description: "负责履职手册中其他类资料更新。",
    color: "cyan",
    icon: FileTextOutlined,
  },
  [ROLE_KEYS.ADMIN_HR]: {
    label: "人力",
    group: "综合管理部",
    unit: "综合管理部-人力",
    scope: "人事与任职落位",
    description: "负责董事简历、系统权限、组织架构和任职手续办理。",
    color: "geekblue",
    icon: TeamOutlined,
  },
  [ROLE_KEYS.ADMIN_DIGITAL]: {
    label: "数字化",
    group: "综合管理部",
    unit: "综合管理部-数字化",
    kind: "category",
    scope: "公司系统功能介绍",
    description: "负责履职手册中支撑机制类系统资料，当前对应公司系统功能介绍。",
    color: "purple",
    icon: TeamOutlined,
  },
  [ROLE_KEYS.ADMIN_BOARD]: {
    label: "董办",
    group: "综合管理部",
    unit: "综合管理部-董办",
    scope: "董事会运行协同",
    description: "负责董事会运行组织、履职计划编排和董事服务支撑。",
    color: "blue",
    icon: TeamOutlined,
  },
  [ROLE_KEYS.EQUITY]: {
    label: "股权运营部",
    group: "部门目录",
    unit: "股权运营部",
    scope: "股权运营核心业务材料",
    description:
      "负责履职手册中业务资料更新，当前对应一口清、一企一策、参股企业介绍。",
    color: "green",
    icon: BankOutlined,
  },
  [ROLE_KEYS.INVESTMENT]: {
    label: "投资部",
    group: "部门目录",
    unit: "投资部",
    scope: "产业投资核心业务材料",
    description:
      "负责履职手册中业务资料更新，当前对应投资研究报告、在管项目基本情况。",
    color: "lime",
    icon: FundOutlined,
  },
  [ROLE_KEYS.AUDIT_LEGAL]: {
    label: "审计风控与法务部",
    group: "部门目录",
    scope: "合规风控与法务",
    description: "负责合规审查、风险监控、法律审核及履职评价相关审核事项。",
    color: "orange",
    icon: AuditOutlined,
  },
};

export const ROLE_DIRECTORY = [
  {
    title: "全局角色",
    type: "global",
    roles: [ROLE_KEYS.GROUP_OFFICE, ROLE_KEYS.LEADERSHIP],
  },
  {
    title: "部门目录",
    type: "department",
    sections: [
      {
        title: "综合管理部",
        subsections: [
          {
            title: "办公室 · 资料类别",
            hidden: true,
            roles: [
              ROLE_KEYS.OFFICE_STRATEGY,
              ROLE_KEYS.OFFICE_PROFILE,
              ROLE_KEYS.OFFICE_SUPPORT,
              ROLE_KEYS.OFFICE_POLICY,
              ROLE_KEYS.OFFICE_OTHER,
            ],
          },
          {
            title: "科室角色",
            roles: [
              ROLE_KEYS.ADMIN_HR,
              ROLE_KEYS.ADMIN_DIGITAL,
              ROLE_KEYS.ADMIN_BOARD,
            ],
          },
        ],
      },
      {
        title: "",
        roles: [ROLE_KEYS.EQUITY],
      },
      {
        title: "",
        roles: [ROLE_KEYS.INVESTMENT],
      },
      {
        title: "",
        roles: [ROLE_KEYS.AUDIT_LEGAL],
      },
    ],
  },
];

export const ROLE_ORDER = [
  ROLE_KEYS.GROUP_OFFICE,
  ROLE_KEYS.LEADERSHIP,
  ROLE_KEYS.OFFICE_STRATEGY,
  ROLE_KEYS.OFFICE_PROFILE,
  ROLE_KEYS.OFFICE_SUPPORT,
  ROLE_KEYS.OFFICE_POLICY,
  ROLE_KEYS.OFFICE_OTHER,
  ROLE_KEYS.ADMIN_HR,
  ROLE_KEYS.ADMIN_DIGITAL,
  ROLE_KEYS.ADMIN_BOARD,
  ROLE_KEYS.EQUITY,
  ROLE_KEYS.INVESTMENT,
  ROLE_KEYS.AUDIT_LEGAL,
];

export const initialRolePersonnel = [
  {
    userId: "200001",
    userName: "刘振",
    orgName: "集团董事会办公室",
    role: ROLE_KEYS.GROUP_OFFICE,
  },
  {
    userId: "200002",
    userName: "张衡",
    orgName: "公司领导班子",
    role: ROLE_KEYS.LEADERSHIP,
  },
  {
    userId: "200003",
    userName: "马莉",
    orgName: "公司领导班子",
    role: ROLE_KEYS.LEADERSHIP,
  },
  {
    userId: "200004",
    userName: "胡欣悦",
    orgName: "综合管理部-办公室",
    role: ROLE_KEYS.OFFICE_STRATEGY,
  },
  {
    userId: "200005",
    userName: "王玥",
    orgName: "综合管理部-办公室",
    role: ROLE_KEYS.OFFICE_PROFILE,
  },
  {
    userId: "200006",
    userName: "周航",
    orgName: "综合管理部-人力",
    role: ROLE_KEYS.ADMIN_HR,
  },
  {
    userId: "200007",
    userName: "林远",
    orgName: "综合管理部-数字化",
    role: ROLE_KEYS.ADMIN_DIGITAL,
  },
  {
    userId: "200008",
    userName: "阮迪",
    orgName: "综合管理部-董办",
    role: ROLE_KEYS.ADMIN_BOARD,
  },
  {
    userId: "200009",
    userName: "王珂",
    orgName: "综合管理部-董办",
    role: ROLE_KEYS.ADMIN_BOARD,
  },
  {
    userId: "200010",
    userName: "赵岩",
    orgName: "审计风控与法务部",
    role: ROLE_KEYS.AUDIT_LEGAL,
  },
  {
    userId: "200011",
    userName: "陈哲",
    orgName: "股权运营部",
    role: ROLE_KEYS.EQUITY,
  },
  {
    userId: "200012",
    userName: "孙博",
    orgName: "投资部",
    role: ROLE_KEYS.INVESTMENT,
  },
];
