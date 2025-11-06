import React from "react";
import PublicNav from "@/components/site/PublicNav";
import PublicFooter from "@/components/site/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { BlogPost } from "@/entities/BlogPost";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Blog() {
  const [posts, setPosts] = React.useState([]);

  React.useEffect(() => {
    const load = async () => {
      const list = await BlogPost.filter({ is_published: true }, "-published_at", 20).catch(()=>[]);
      setPosts(list);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <section className="pt-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">Blog</h1>
          <p className="mt-4 text-slate-600 text-lg">Insights on recruiting, process, and tech.</p>
        </div>

        <div className="mx-auto max-w-6xl px-6 mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(p => (
            <Card key={p.id} className="hover:shadow-md transition">
              <CardContent className="p-0">
                {p.cover_image_url && <img src={p.cover_image_url} alt={p.title} className="w-full h-48 object-cover rounded-t-lg" />}
                <div className="p-6">
                  <h3 className="font-medium text-slate-900">{p.title}</h3>
                  <p className="text-slate-600 text-sm mt-2">{p.summary}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {!posts.length && <div className="text-slate-600">No posts yet.</div>}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}