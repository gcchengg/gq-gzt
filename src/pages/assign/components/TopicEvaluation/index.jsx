import {
    CheckSquareOutlined,
    QuestionCircleOutlined,
} from "@ant-design/icons";
import { Button, Empty, Space, Table, Tabs, Tag, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import EvaluationDetail from "./EvaluationDetail";
import styles from "./index.module.css";

const categorySmall =
    "1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）";

const createInitialTopics = (projectData) => [
    {
        id: "evaluation-001",
        categoryMain: "1. 经营类",
        categoryMiddle: "1.3 定期监管报告",
        categorySmall,
        topicName: projectData.topicName || "测试议题1",
        approvalLevel: "业务总监",
        boardMeeting: true,
        supervisorMeeting: false,
        shareholderMeeting: false,
        status: "评估中",
        level: 1,
    },
    {
        id: "evaluation-002",
        categoryMain: "1. 经营类",
        categoryMiddle: "1.3 定期监管报告",
        categorySmall,
        topicName: "测试议题2",
        approvalLevel: "业务总监",
        boardMeeting: true,
        supervisorMeeting: false,
        shareholderMeeting: false,
        status: "评估中",
        level: 2,
    },
];

export default function TopicEvaluation({ projectData = {} }) {
    const [topics, setTopics] = useState(() => createInitialTopics(projectData));
    const [completed, setCompleted] = useState(false);
    const [activeTopic, setActiveTopic] = useState(null);

    useEffect(() => {
        if (!projectData.topicName) return;
        setTopics((currentTopics) =>
            currentTopics.map((topic) =>
                topic.id === "evaluation-001"
                    ? { ...topic, topicName: projectData.topicName }
                    : topic,
            ),
        );
    }, [projectData.topicName]);

    const moveTopic = (index, offset) => {
        const targetIndex = index + offset;
        if (targetIndex < 0 || targetIndex >= topics.length) return;

        setTopics((currentTopics) => {
            const nextTopics = [...currentTopics];
            [nextTopics[index], nextTopics[targetIndex]] = [
                nextTopics[targetIndex],
                nextTopics[index],
            ];
            return nextTopics;
        });
    };

    const sortTopics = () => {
        setTopics((currentTopics) =>
            currentTopics.toSorted((left, right) => left.level - right.level),
        );
        message.success("已按议题分级自动排序");
    };

    const finishEvaluation = () => {
        setCompleted(true);
        setTopics((currentTopics) =>
            currentTopics.map((topic) => ({ ...topic, status: "已评估" })),
        );
        message.success("议题评估已完成");
    };

    const columns = useMemo(
        () => [
            {
                title: "序号",
                width: 58,
                align: "center",
                render: (_, __, index) => index + 1,
            },
            {
                title: (
                    <span>
                        议题分类
                        <br />
                        （大）
                    </span>
                ),
                dataIndex: "categoryMain",
                width: 120,
            },
            {
                title: (
                    <span>
                        议题分类
                        <br />
                        （中）
                    </span>
                ),
                dataIndex: "categoryMiddle",
                width: 145,
            },
            {
                title: "议题分类（小）",
                dataIndex: "categorySmall",
                width: 390,
            },
            {
                title: (
                    <span>
                        议题
                        <br />
                        名称
                    </span>
                ),
                dataIndex: "topicName",
                width: 130,
            },
            {
                title: (
                    <span>
                        审批
                        <br />
                        层级
                    </span>
                ),
                dataIndex: "approvalLevel",
                width: 90,
                align: "center",
            },
            {
                title: "董事会",
                dataIndex: "boardMeeting",
                width: 70,
                align: "center",
                render: (checked) => (checked ? "√" : "-"),
            },
            {
                title: "监事会",
                dataIndex: "supervisorMeeting",
                width: 70,
                align: "center",
                render: (checked) => (checked ? "√" : "-"),
            },
            {
                title: "股东会",
                dataIndex: "shareholderMeeting",
                width: 70,
                align: "center",
                render: (checked) => (checked ? "√" : "-"),
            },
            {
                title: "状态",
                dataIndex: "status",
                width: 100,
                align: "center",
                render: (status) => (
                    <Tag color={status === "已评估" ? "success" : "processing"}>
                        {status}
                    </Tag>
                ),
            },
            {
                title: "操作",
                width: 170,
                fixed: "right",
                align: "center",
                render: (_, topic, index) => (
                    <Space size={4}>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => setActiveTopic(topic)}
                        >
                            评估
                        </Button>
                        <Button
                            type="link"
                            size="small"
                            disabled={index === 0}
                            onClick={() => moveTopic(index, -1)}
                        >
                            上移
                        </Button>
                        <Button
                            type="link"
                            size="small"
                            disabled={index === topics.length - 1}
                            onClick={() => moveTopic(index, 1)}
                        >
                            下移
                        </Button>
                    </Space>
                ),
            },
        ],
        [topics.length],
    );

    const items = [
        {
            key: "evaluation",
            label: (
                <span>
                    <CheckSquareOutlined />
                    议题评估
                </span>
            ),
            children: (
                <div className={styles.tableCard}>
                    <div className={styles.actionBar}>
                        <span className={styles.summary}>
                            共 {topics.length} 项议题，当前按评估等级排列
                        </span>
                        <Button onClick={sortTopics}>自动分级排序</Button>
                    </div>
                    <div className={styles.tableWrap}>
                        <Table
                            rowKey="id"
                            bordered
                            pagination={false}
                            columns={columns}
                            dataSource={topics}
                            scroll={{ x: 1413 }}
                        />
                    </div>
                    <div className={styles.footer}>
                        <Button
                            type="primary"
                            disabled={completed}
                            onClick={finishEvaluation}
                        >
                            {completed ? "评估已完成" : "评估完成"}
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            key: "qa",
            label: (
                <span>
                    <QuestionCircleOutlined />
                    议题初审问答(0件未处理)
                </span>
            ),
            children: (
                <div className={styles.emptyCard}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="暂无问答数据"
                    />
                </div>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            <Tabs className={styles.tabs} defaultActiveKey="evaluation" items={items} />
            <EvaluationDetail
                open={Boolean(activeTopic)}
                topic={activeTopic}
                onClose={() => setActiveTopic(null)}
            />
        </div>
    );
}
