import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText } from "lucide-react";
import { Playbook } from "@/entities/Playbook";

export default function PlaybookPreview({ id }) {
  const [pb, setPb] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await Playbook.filter({ id }, "-created_date", 1);
      if (!mounted) return;
      setPb(r?.[0] || null);
    })();
    return () => { mounted = false; };
  }, [id]);

  if (!pb) return <div className="flex items-center justify-center h-24 text-slate-600"><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading playbook…</div>;

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">{pb.title}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">{pb.category}</Badge>
          {pb.is_active === false && <Badge className="bg-slate-200 text-slate-700">Inactive</Badge>}
        </div>
      </CardContent></Card>

      {Array.isArray(pb.tags) && pb.tags.length > 0 && (
        <Card><CardContent className="p-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Tags</p>
          <div className="flex flex-wrap gap-1">{pb.tags.map((t,i)=> <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}</div>
        </CardContent></Card>
      )}
    </div>
  );
}