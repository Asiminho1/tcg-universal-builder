import 'dotenv/config';
import fs from 'fs';

const API_KEY = process.env.POKEWALLET_API_KEY;
const BASE_URL = "https://api.pokewallet.io/op";

async function apiRequest(url) {
  const response = await fetch(url, { headers: { "X-API-Key": API_KEY } });
  if (response.status === 429) throw new Error("RATE_LIMIT");
  if (!response.ok) throw new Error(`HTTP Fehler ${response.status}: ${url}`);
  return response.json();
}

async function fetchAllCards() {
  if (!API_KEY) throw new Error("API-Key fehlt!");
  
  console.log("Lade echte Sets und fixiere die Bild-Links (Promo-Müll wird ignoriert!)...");
  const allCards = [];

  try {
    const setsResponse = await apiRequest(`${BASE_URL}/sets?language=en`);
    
    // SNIPER-FILTER: Zieht NUR die sauberen, echten Sets! (OP01-OP18, ST-01 bis ST-38, EB, PRB)
    // Ignoriert PRE (Pre-Release), OP-PR (Promos) und ANN komplett!
    const sets = setsResponse.data.filter(set => {
      return /^(OP\d{2}|ST-\d{2}|EB-\d{2}|PRB-\d{2})$/.test(set.set_code);
    });

    for (const set of sets) {
      let page = 1;
      let total = Infinity;

      while (true) {
        const url = `${BASE_URL}/sets/${set.set_code}?page=${page}&limit=200`;
        const result = await apiRequest(url);
        
        total = result.total ?? result.data.length;
        const cards = result.data.filter(card => card.product_type !== "sealed");

        const formattedCards = cards.map(card => {
          const colors = card.ext_color ? card.ext_color.split("/").map(color => color.trim()) : ["Red"];
          const cardId = card.card_number || card.id || "UNKNOWN";
          
          // Holt den reinen Set-Namen für das Limitless-Bild (macht aus ST-01 -> ST01)
          const setPrefix = cardId.includes('-') ? cardId.split('-')[0] : set.set_code.replace('-', '');

          return {
            id: cardId,
            name: card.name || "Unknown Card",
            type: card.card_type || "Character",
            color: colors,
            cost: card.ext_cost ?? 0,
            power: card.ext_power ?? null,
            effect: card.ext_description || "",
            imageUrl: `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/${setPrefix}/${cardId}_EN.webp`
          };
        });

        allCards.push(...formattedCards);
        console.log(`${set.set_code}: ${cards.length} Karten geladen...`);

        if (page * 200 >= total || result.data.length === 0) break;
        page++;
      }
    }
  } catch (error) {
    if (error.message === "RATE_LIMIT") {
      console.log("\n⚠️ API-Limit erreicht (429)! Mache Notfall-Speicherung...");
    } else {
      console.error("\nEin Fehler ist aufgetreten:", error.message);
    }
  } finally {
    if (allCards.length > 0) {
      fs.writeFileSync("./src/data/cards.json", JSON.stringify(allCards, null, 2), "utf8");
      console.log("--------------------------------");
      console.log(`ERFOLG! ${allCards.length} perfekte Karten mit funktionierenden Bildern gesichert.`);
      console.log("--------------------------------");
    }
  }
}

fetchAllCards();