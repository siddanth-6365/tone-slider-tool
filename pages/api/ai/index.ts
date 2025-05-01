import type { NextApiRequest, NextApiResponse } from "next";
import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? "",
});

interface Tone {
  tone: string;
  weight: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { text, tones }: { text: string; tones: Tone[] } = req.body;
  if (!text || !Array.isArray(tones) || tones.length === 0) {
    return res.status(400).json({ error: "Missing text or tones array" });
  }

  const toneList = tones
    .map((t) => `${t.tone} (weight: ${t.weight})`)
    .join(" and ");
  const systemMessage =
    `You are a skilled writer. Rewrite the input to reflect these tones: ${toneList}. ` +
    "Keep the meaning but make it concise. Do NOT quote or add extra commentary.";
  const userMessage = `TEXT: \"${text}\"\nTONES: ${toneList}`;

  try {
    const result = await mistral.chat.complete({
      model: "mistral-small-latest",
      stream: false,
      temperature: 1.5,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
    });

    const generated = result.choices?.[0]?.message.content ?? "";
    return res.status(200).json({ text: generated });
  } catch (error) {
    console.error("Mistral client error:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate text via Mistral client" });
  }
}
