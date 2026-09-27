import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/axios";
import SLACountdown from "../components/slaCountdown";

type Event = {
  id: string;
  eventType: string;
  metadata: any;
  createdAt: string;
  user: {
    name: string;
    role: string;
  } | null;
};

const RequestDetails = () => {
  const { requestId } = useParams();

  const [request, setRequest] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/requests/${requestId}`)
      .then((response) => {
        setRequest(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [requestId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!request) {
    return <div>Request not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm font-medium text-blue-600">
        ← Back to Dashboard
      </Link>

      <div className="rounded-xl border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Request</p>

            <h1 className="text-2xl font-bold">
              Room {request.room.roomNumber}
            </h1>
          </div>

          <SLACountdown
            deadline={request.slaDeadline}
            status={request.status}
            escalatedAt={request.escalatedAt}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info label="Guest" value={request.guest.name} />

          <Info label="Category" value={request.category.replace("_", " ")} />

          <Info label="Priority" value={request.priority} />

          <Info label="Status" value={request.status.replace("_", " ")} />

          <Info
            label="Assigned Staff"
            value={request.assignedTo?.name || "Unassigned"}
          />

          <Info
            label="Created"
            value={new Date(request.createdAt).toLocaleString()}
          />
        </div>

        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <p className="mb-1 text-sm font-medium">Description</p>

          <p className="text-slate-600">{request.description}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold">Request History</h2>

        <div className="space-y-6">
          {request.events.map((event: Event) => (
            <div key={event.id} className="flex gap-4">
              <div className="mt-1 h-3 w-3 rounded-full bg-slate-900" />

              <div>
                <p className="font-medium">
                  {event.eventType.replace("_", " ")}
                </p>

                <p className="text-sm text-slate-500">
                  {event.user?.name || "System"}
                  {" • "}
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs uppercase text-slate-400">{label}</p>
    <p className="mt-1 font-medium">{value}</p>
  </div>
);

export default RequestDetails;
