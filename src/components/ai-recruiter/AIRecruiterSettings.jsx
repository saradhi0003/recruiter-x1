import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function AIRecruiterSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await base44.entities.AIRecruiterSettings.list("", 1);
      if (data.length > 0) {
        setSettings(data[0]);
      } else {
        // Create default settings
        const defaultSettings = await base44.entities.AIRecruiterSettings.create({
          default_model: "gpt-4o-mini",
          matching_model: "gpt-4o-mini",
          drafting_model: "gpt-4o",
          parsing_model: "gpt-4o-mini",
          max_candidates: 50,
          minimum_match_score: 50,
          require_human_approval: true,
          gmail_draft_enabled: false,
          zoho_sync_enabled: false,
          openai_enabled: true,
          fallback_to_base44_llm: true,
        });
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await base44.entities.AIRecruiterSettings.update(settings.id, settings);
      alert("Settings saved successfully");
    } catch (error) {
      alert(`Error saving settings: ${error.message}`);
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return <div className="text-center py-8">Failed to load settings</div>;
  }

  return (
    <Card className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">AI Recruiter Settings</h2>

      <div className="space-y-6">
        {/* Models */}
        <div>
          <h3 className="font-semibold mb-3 text-lg">LLM Models</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Default Model</label>
              <Select value={settings.default_model} onValueChange={(v) => setSettings({ ...settings, default_model: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-5-mini">GPT-5 Mini</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Matching Model</label>
              <Select value={settings.matching_model} onValueChange={(v) => setSettings({ ...settings, matching_model: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Drafting Model</label>
              <Select value={settings.drafting_model} onValueChange={(v) => setSettings({ ...settings, drafting_model: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Matching Settings */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3 text-lg">Matching Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Max Candidates to Return</label>
              <Input
                type="number"
                value={settings.max_candidates}
                onChange={(e) => setSettings({ ...settings, max_candidates: parseInt(e.target.value) })}
                min="1"
                max="200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Minimum Match Score</label>
              <Input
                type="number"
                value={settings.minimum_match_score}
                onChange={(e) => setSettings({ ...settings, minimum_match_score: parseInt(e.target.value) })}
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3 text-lg">Features</h3>
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.require_human_approval}
                onChange={(e) => setSettings({ ...settings, require_human_approval: e.target.checked })}
              />
              <span>Require human approval for all actions (recommended: ON)</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.openai_enabled}
                onChange={(e) => setSettings({ ...settings, openai_enabled: e.target.checked })}
              />
              <span>Use OpenAI for matching and drafting</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.fallback_to_base44_llm}
                onChange={(e) => setSettings({ ...settings, fallback_to_base44_llm: e.target.checked })}
              />
              <span>Fall back to Base44 LLM if OpenAI fails</span>
            </label>

            <label className="flex items-center gap-3 opacity-50 cursor-not-allowed">
              <input type="checkbox" disabled checked={false} />
              <span>Gmail draft sync (coming soon)</span>
            </label>

            <label className="flex items-center gap-3 opacity-50 cursor-not-allowed">
              <input type="checkbox" disabled checked={false} />
              <span>Zoho sync (coming soon)</span>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="border-t pt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={loadSettings}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Settings
          </Button>
        </div>
      </div>
    </Card>
  );
}