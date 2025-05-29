import { serve } from "https://deno.land/std/http/server.ts";

// Konfigurasi
const TELEGRAM_BOT_TOKEN = "8127447550:AAGKdqsYEwxT9iEYWrrGgijakir9qTzJVsU";
const CHANNEL_ID = "@info_seputarforex";
const SIGNAL_API = "https://corsproxy.io/?https://www.myfxbook.com/api/get-community-outlook.json?session=9UtvFTG9S31Z4vO1aDW31671626";
const SUPABASE_URL = 'https://oaatowhxrefpjlwucvvg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYXRvd2h4cmVmcGpsd3VjdnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzgzMDQsImV4cCI6MjA2NDAxNDMwNH0.-Qf6y5JiWVx2P[...]';

// Konversi 20/50/100 pips jadi harga (dalam 4 digit: 0.0020 = 20 pips)
const pipToPrice = (pips: number) => pips * 0.0001;

let lastSent: Record<string, number> = {};

async function insertSignalToSupabase(signal: any) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/forex`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: JSON.stringify([signal]),
  });
  if (!response.ok) {
    const err = await response.text();
    console.error("Gagal insert ke Supabase:", err);
    return null;
  }
  return await response.json();
}

async function sendSignalToTelegram(text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text,
      parse_mode: "Markdown"
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    console.error("Gagal kirim ke Telegram:", err);
    return null;
  }
  return await resp.json();
}

serve(async (req) => {
  try {
    const res = await fetch(SIGNAL_API);
    const json = await res.json();
    const data = json.data;

    for (const sinyal of data) {
      const pair = sinyal.name;
      const buy = parseFloat(sinyal.longPercentage);
      const sell = parseFloat(sinyal.shortPercentage);
      const currentPrice = parseFloat(sinyal.avgPrice);

      let type = "";
      if (buy >= 70) type = "BUY";
      else if (sell >= 70) type = "SELL";
      else continue;

      const key = `${pair}-${type}`;
      const now = Date.now();

      if (!lastSent[key] || now - lastSent[key] > 6 * 3600 * 1000) {
        let entry, tp1, tp2, tp3, sl1, sl2, text;

        if (type === "BUY") {
          entry = (currentPrice - pipToPrice(20)).toFixed(5);
          tp1 = (parseFloat(entry) + pipToPrice(20)).toFixed(5);
          tp2 = (parseFloat(entry) + pipToPrice(50)).toFixed(5);
          tp3 = (parseFloat(entry) + pipToPrice(100)).toFixed(5);
          sl1 = (parseFloat(entry) - pipToPrice(20)).toFixed(5);
          sl2 = (parseFloat(entry) - pipToPrice(20)).toFixed(5);

          text = `📈 *New signal BUY*

*Recomend price:* ${entry}

*Take profit:*
TP 1: ${tp1}
TP 2: ${tp2}
TP 3: ${tp3}

*Stop loss:*
SL 1: ${sl1}
SL 2: ${sl2}`;
        } else {
          entry = (currentPrice + pipToPrice(20)).toFixed(5);
          tp1 = (parseFloat(entry) - pipToPrice(20)).toFixed(5);
          tp2 = (parseFloat(entry) - pipToPrice(50)).toFixed(5);
          tp3 = (parseFloat(entry) - pipToPrice(100)).toFixed(5);
          sl1 = (parseFloat(entry) + pipToPrice(20)).toFixed(5);
          sl2 = (parseFloat(entry) + pipToPrice(20)).toFixed(5);

          text = `📉 *New signal SELL*

*Recomend price:* ${entry}

*Take profit:*
TP 1: ${tp1}
TP 2: ${tp2}
TP 3: ${tp3}

*Stop loss:*
SL 1: ${sl1}
SL 2: ${sl2}`;
        }

        // Data untuk Supabase
        const signalObj = {
          pair,
          type,
          entry,
          tp1,
          tp2,
          tp3,
          sl1,
          sl2,
          source: "myfxbook",
          sent_to: "telegram",
          sent_at: new Date().toISOString(),
          raw_json: JSON.stringify(sinyal),
        };

        // Insert ke Supabase
        await insertSignalToSupabase(signalObj);

        // Kirim ke Telegram
        await sendSignalToTelegram(text);

        lastSent[key] = now;
      }
    }
    return new Response("OK");
  } catch (err) {
    return new Response("Error: " + err.message, { status: 500 });
  }
});
