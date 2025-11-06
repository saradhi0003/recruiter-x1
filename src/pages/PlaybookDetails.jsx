import React from "react";
import { Playbook } from "@/entities/Playbook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, Video, Link as LinkIcon } from "lucide-react";

export default function PlaybookDetailsPage() {
  const [playbook, setPlaybook] = React.useState(null);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (!id) return;
    const load = async () => {
      const rec = await Playbook.get(id);
      setPlaybook(rec);
    };
    load();
  }, []);

  if (!playbook) return <div className="p-6">Loading...</div>;

  const DocIcon = ({ type }) => {
    const map = { pdf: FileText, doc: FileText, video: Video, link: LinkIcon, template: FileText };
    const Icon = map[type] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader className="flex items-center gap-3">
          <CardTitle className="text-2xl">{playbook.title}</CardTitle>
          {playbook.category && <Badge variant="secondary" className="capitalize">{String(playbook.category).replace("_"," ")}</Badge>}
        </CardHeader>
        <CardContent className="space-y-6">
          {playbook.description && (
            <div>
              <p className="text-slate-700">{playbook.description}</p>
            </div>
          )}

          {Array.isArray(playbook.steps) && playbook.steps.length > 0 && (
            <div>
              <p className="font-medium mb-2">Process Steps</p>
              <ol className="space-y-2">
                {playbook.steps
                  .slice()
                  .sort((a,b)=> (a.order||0) - (b.order||0))
                  .map((s, i)=>(
                  <li key={i} className="p-3 rounded border bg-slate-50">
                    <div className="font-medium">{s.title || `Step ${i+1}`}</div>
                    {s.description && <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{s.description}</div>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {Array.isArray(playbook.documents) && playbook.documents.length > 0 && (
            <div>
              <p className="font-medium mb-2">Documents & Links</p>
              <div className="space-y-2">
                {playbook.documents.map((d, i)=>(
                  <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded border hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <DocIcon type={d.type} />
                      <div>
                        <div className="font-medium text-sm">{d.name}</div>
                        {d.description && <div className="text-xs text-slate-600">{d.description}</div>}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(playbook.tags) && playbook.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {playbook.tags.map((t,i)=><Badge key={i} variant="outline">{t}</Badge>)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}