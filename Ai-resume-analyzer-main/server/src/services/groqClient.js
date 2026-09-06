import Groq from "groq-sdk";

let cachedClient = null;

/**
 * Equivalent of get_llm() in parser.py: returns a configured Groq client,
 * raising the same style of error if the API key is missing.
 */
export function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY not found. Please add it to your .env file.");
  }

  if (!cachedClient) {
    cachedClient = new Groq({ apiKey });
  }

  return cachedClient;
}

export function getGroqModel() {
  // Llama 3.3 70B was retired from Groq's free/developer tiers on 2026-08-16.
  // Keep this configurable for accounts with custom access, same as GROQ_MODEL
  // in the original Python .env.
  return process.env.GROQ_MODEL || "openai/gpt-oss-120b";
}

/**
 * Calls Groq chat completions with a strict JSON-schema style contract,
 * mirroring `llm.with_structured_output(Model, method="json_schema", strict=True)`.
 * Groq's OpenAI-compatible API is used with response_format json_schema when
 * supported by the model, falling back to json_object mode automatically.
 */
export async function callGroqStructured({ systemPrompt, userPrompt, jsonSchema, temperature = 0 }) {
  const client = getGroqClient();
  const model = getGroqModel();

  const basePayload = {
    model,
    temperature,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  try {
    const response = await client.chat.completions.create({
      ...basePayload,
      response_format: {
        type: "json_schema",
        json_schema: { name: jsonSchema.name, schema: jsonSchema.schema, strict: true },
      },
    });
    return response.choices[0].message.content;
  } catch (error) {
    // Not every Groq-hosted model supports strict json_schema mode.
    // Fall back to json_object mode with the schema embedded in the prompt,
    // the same safety net the README recommends when swapping GROQ_MODEL.
    const response = await client.chat.completions.create({
      ...basePayload,
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\nRespond with ONLY a JSON object that strictly matches this JSON Schema, no prose, no markdown fences:\n${JSON.stringify(
            jsonSchema.schema
          )}`,
        },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });
    return response.choices[0].message.content;
  }
}
