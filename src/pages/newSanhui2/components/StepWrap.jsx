import classNames from "classnames";
import "./StepWrap.css";

export default function StepWrap({ item = {}, isSelectStep }) {
  return (
    <div
      className={classNames("new-sanhui-step-info", {
        active: isSelectStep !== "finish",
      })}
    >
      <div className="new-sanhui-step-name">{item.text}</div>
    </div>
  );
}
