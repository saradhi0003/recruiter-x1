import { AppSettings } from "@/entities/AppSettings";
import { User } from "@/entities/User";
import { SendEmail } from "@/integrations/Core";

function sleep(ms) { return new Promise((res) => setTimeout(res, ms)); }

export async function sendAppEmail({ to, subject, body }) {
  const list = await AppSettings.list("-updated_date", 1);
  const settings = list[0];
  if (!settings || settings.email_provider === "none" || !settings.provider_connected) {
    const provider = settings ? settings.email_provider : "none";
    throw new Error(
      `Email not enabled. Current provider: ${provider}. Connect Gmail or Outlook in Email Settings to enable sending.`
    );
  }

  let from_name = undefined;
  try {
    const me = await User.me();
    if (me?.full_name) from_name = me.full_name;
  } catch (_) {
    // not logged in or failed to fetch user; ignore
  }

  // Retry with exponential backoff on transient errors (429/5xx)
  const maxAttempts = 3;
  let attempt = 0;
  while (true) {
    try {
      await SendEmail({ to, subject, body, from_name });
      return true;
    } catch (err) {
      attempt += 1;
      const msg = String(err?.message || "");
      const status = (err && err.status) || (err?.response && err.response.status);
      const isTransient = status === 429 || (status >= 500 && status < 600) || /rate/i.test(msg);
      if (!isTransient || attempt >= maxAttempts) {
        throw err;
      }
      const delay = 500 * Math.pow(2, attempt - 1); // 500ms, 1s
      await sleep(delay);
    }
  }
}