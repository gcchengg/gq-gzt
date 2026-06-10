import "antd/dist/reset.css";
import AssignFollow from "../assign/components/AssignFollow";
import "./index.css";

export default function FollowUpPage() {
  return (
    <div className="follow-up-page">
      <section className="follow-up-panel">
        <AssignFollow
          id="assign-001"
          editStatus="edit"
          filterFollowFromType="threeMeetingFeedback"
          allowCreate={false}
        />
      </section>
    </div>
  );
}
