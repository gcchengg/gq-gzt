import React, { useState, useRef, useEffect } from "react";
import { Steps, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./index.less"; // 自定义样式

const { Step } = Steps;

const ScrollableSteps = ({ steps, propCurrent, onChange }) => {
  const [current, setCurrent] = useState(propCurrent || steps.length - 1);
  const stepsRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // 同步外部传入的current
  useEffect(() => {
    if (propCurrent !== undefined && propCurrent !== current) {
      setCurrent(propCurrent);
      scrollToStep(propCurrent);
    }
  }, [propCurrent]);

  // 初始化时滚动到最后一步
  useEffect(() => {
    if (stepsRef.current) {
      setTimeout(() => {
        scrollToStep(steps.length - 1);
      }, 100);
    }
  }, []);

  const scrollToStep = (index) => {
    if (stepsRef.current) {
      const container = stepsRef.current;
      const stepElements = container.querySelectorAll(".ant-steps-item");

      if (stepElements[index]) {
        stepElements[index].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }

      // 更新箭头显示状态
      updateArrowsVisibility();
    }
  };

  const updateArrowsVisibility = () => {
    if (stepsRef.current) {
      const container = stepsRef.current;
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth,
      );
    }
  };

  const handleScroll = () => {
    updateArrowsVisibility();
  };

  const scroll = (direction) => {
    if (stepsRef.current) {
      const container = stepsRef.current;
      const scrollAmount = 200; // 每次滚动的像素数

      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const handleStepChange = (index) => {
    setCurrent(index);
    scrollToStep(index);
    if (onChange) {
      onChange(index);
    }
  };

  return (
    <div className="scrollable-steps-container">
      {showLeftArrow && (
        <Button
          className="steps-arrow left-arrow"
          icon={<LeftOutlined />}
          onClick={() => scroll("left")}
        />
      )}

      <div ref={stepsRef} className="scrollable-steps" onScroll={handleScroll}>
        <Steps current={current} size="small" items={steps} />
      </div>

      {showRightArrow && (
        <Button
          className="steps-arrow right-arrow"
          icon={<RightOutlined />}
          onClick={() => scroll("right")}
        />
      )}
    </div>
  );
};

export default ScrollableSteps;
