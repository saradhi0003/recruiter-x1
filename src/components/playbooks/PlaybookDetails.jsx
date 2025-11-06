import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, FileText, Video, Link as LinkIcon } from "lucide-react";

export default function PlaybookDetails({ playbook, onClose }) {
  if (!playbook) return null;

  const DocIcon = ({ type }) => {
    const map = { pdf: FileText, doc: FileText, video: Video, link: LinkIcon, template: FileText };
    const Icon = map[type] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-auto" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{playbook.title}</h2>
            {playbook.category && <Badge variant="secondary" className="capitalize">{String(playbook.category).replace("_"," ")}</Badge>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="p-5 space-y-6">
          {playbook.description && (
            <div>
              <h3 className="font-medium mb-1">Description</h3>
              <p className="text-slate-700">{playbook.description}</p>
            </div>
          )}

          {Array.isArray(playbook.steps) && playbook.steps.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Process Steps</h3>
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
              <h3 className="font-medium mb-2">Documents & Links</h3>
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
        </div>
      </div>
    </div>
  );
}