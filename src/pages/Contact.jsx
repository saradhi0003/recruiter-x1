import React from "react";
import PublicNav from "@/components/site/PublicNav";
import PublicFooter from "@/components/site/PublicFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormSubmission } from "@/entities/FormSubmission";

export default function Contact() {
  const [form, setForm] = React.useState({ name: "", email: "", company: "", message: "" });
  const [sent, setSent] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    await FormSubmission.create({
      page_slug: "contact",
      form_id: "contact_main",
      data: form
    });
    setSent(true);
    setForm({ name: "", email: "", company: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <section className="pt-16">
        <div className="mx-auto max-w-3xl px-6">
          <Card>
            <CardHeader><CardTitle>Contact Us</CardTitle></CardHeader>
            <CardContent>
              {sent ? (
                <div className="p-4 rounded-md bg-green-50 text-green-700">Thanks! We received your message.</div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <Input placeholder="Your name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
                  <Input type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
                  <Input placeholder="Company (optional)" value={form.company} onChange={(e)=>setForm({...form, company:e.target.value})} />
                  <Textarea rows={5} placeholder="How can we help?" value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} required />
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Send</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}