
import { ActivityLog } from "../components/ActivityLog/ActivityLog";

const ActivityPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Activity Log</h1>
      <ActivityLog />
    </div>
  );
};

export default ActivityPage;
