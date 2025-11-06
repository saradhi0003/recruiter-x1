import React from "react";
import CandidatePreview from "@/components/candidates/CandidatePreview";
import { Candidate } from "@/entities/Candidate";
import { Loader2 } from "lucide-react";

export default function CandidatePreviewLoader({ id, onEdit, onUpdated }) {
  const [record, setRecord] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await Candidate.filter({ id }, "-created_date", 1);
      if (!mounted) return;
      setRecord(res && res[0] ? res[0] : null);
    })();
    return () => { mounted = false; };
  }, [id]);

  if (!record) {
    return (
      <div className="flex items-center justify-center h-24 text-slate-600">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading candidate…
      </div>
    );
  }

  return <CandidatePreview candidate={record} onEdit={onEdit} onUpdated={onUpdated} />;
}