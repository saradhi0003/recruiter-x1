import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Loader2 } from "lucide-react";
import { sendAppEmail } from "@/components/utils/email";

export default function EmailModal({ open, to, defaultSubject = "", defaultBody = "", onClose }) {
  const [subject, setSubject] = React.useState(defaultSubject);
  const [body, setBody] = React.useState(defaultBody);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setSubject(defaultSubject || "");
      setBody(defaultBody || "");
      setError("");
    }
  }, [open, defaultSubject, defaultBody]);

  const send = async () => {
    setSending(true);
    setError("");
    try {
      await sendAppEmail({ to, subject, body });
      onClose?.(true);
    } catch (e) {
      setError(e?.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => onClose?.(false)}>
      <Card className="w-full max-w-2xl" onClick={(e)=>e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Send Email</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onClose?.(false)}><X className="w-5 h-5" /></Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-slate-600">To: <span className="font-medium text-slate-900">{to}</span></div>
          <Input placeholder="Subject" value={subject} onChange={(e)=>setSubject(e.target.value)} />
          <Textarea rows={8} placeholder="Write your message..." value={body} onChange={(e)=>setBody(e.target.value)} />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onClose?.(false)}>Cancel</Button>
            <Button onClick={send} disabled={sending} className="gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}