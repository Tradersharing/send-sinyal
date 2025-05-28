import { serve } from "https://deno.land/std/http/server.ts";

const TELEGRAM_BOT_TOKEN = "8127447550:AAGKdqsYEwxT9iEYWrrGgijakir9qTzJVsU";
const CHANNEL_ID = "@info_seputarforex";
const SIGNAL_API = "https://corsproxy.io/?https://www.myfxbook.com/api/get-community-outlook.json?session=9UtvFTG9S31Z4vO1aDW31671626";

let lastSent: Record<string, number> = {}; // key: pair+type, value: timestamp

// Konversi 20/50/100 pips jadi harga (dalam 4 digit: 0.0020 = 20 pips)
const pipToPrice = (pips: number) => pips * 0.0001;

serve(async (req) => {
  try {
    const res = await fetch(SIGNAL_API);
    const json = await res.json();
    const data = json.data;

    for (const sinyal of data) {
      const pair = sinyal.name;
      const buy = parseFloat(sinyal.longPercentage);
      const sell = parseFloat(sinyal.shortPercentage);
      const currentPrice = parseFloat(sinyal.avgPrice); // harga sekarang

      let type = "";
      if (buy >= 70) type = "BUY";
      else if (sell >= 70) type = "SELL";
      else continue;

      const key = `${pair}-${type}`;
      const now = Date.now();

      if (!lastSent[key] || now - lastSent[key] > 6 * 3600 * 1000) {
        let text = "";
        if (type === "BUY") {
          const entry = (currentPrice - pipToPrice(20)).toFixed(5);
          const tp1 = (parseFloat(entry) + pipToPrice(20)).toFixed(5);
          const tp2 = (parseFloat(entry) + pipToPrice(50)).toFixed(5);
          const tp3 = (parseFloat(entry) + pipToPrice(100)).toFixed(5);
          const sl1 = (parseFloat(entry) - pipToPrice(20)).toFixed(5);
          const sl2 = (parseFloat(entry) - pipToPrice(20)).toFixed(5);

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
          const entry = (currentPrice + pipToPrice(20)).toFixed(5);
          const tp1 = (parseFloat(entry) - pipToPrice(20)).toFixed(5);
          const tp2 = (parseFloat(entry) - pipToPrice(50)).toFixed(5);
          const tp3 = (parseFloat(entry) - pipToPrice(100)).toFixed(5);
          const sl1 = (parseFloat(entry) + pipToPrice(20)).toFixed(5);
          const sl2 = (parseFloat(entry) + pipToPrice(20)).toFixed(5);

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

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHANNEL_ID,
            text: text,
            parse_mode: "Markdown"
          }),
        });

        lastSent[key] = now;
      }
    }

    return new Response("OK");
  } catch (err) {
    return new Response("Error: " + err.message, { status: 500 });
  }
});
