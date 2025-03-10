import { Ratelimit } from "@upstash/ratelimit";
import redis from "../../utils/redis";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Create a new ratelimiter, that allows 10 requests per 12 hours
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(10, "720 m"),
      analytics: true,
    })
  : undefined;

export async function POST(request: Request) {
  try {
    // Проверяем наличие API ключа
    const apiKey = process.env.REPLICATE_API_KEY;
    if (!apiKey) {
      console.error("REPLICATE_API_KEY is not set");
      return new NextResponse(
        JSON.stringify({ error: "Server configuration error: API key is not set" }),
        { status: 500 }
      );
    }

    // Rate Limiter Code
    if (ratelimit) {
      const headersList = headers();
      const ipIdentifier = headersList.get("x-real-ip");

      const result = await ratelimit.limit(ipIdentifier ?? "");

      if (!result.success) {
        // Информативный ответ об ограничении
        return NextResponse.json(
          { 
            error: "Rate limit reached",
            message: "You have reached the limit of 10 room generations per 12 hours. Please try again after 12 hours from your first generation. This limit helps us maintain service quality for all users.",
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
            resetInHours: Math.round((result.reset - Date.now()) / 3600000)
          },
          { status: 429 }
        );
      }
    }

    const { imageUrl, theme, room, prompt: userPrompt, customPrompt, generationType, architecture, colorPalette, scale } = await request.json();
    console.log('1. Received data:', { imageUrl, theme, room, userPrompt, customPrompt, generationType, architecture, colorPalette, scale });

    // Базовые ограничения с акцентом на единую композицию
    const baseConstraints = `Create a single, cohesive room design. Keep the original wall and window layout exactly as is - no new windows in solid walls. Ignore existing furniture, decorations and materials in the room - focus only on the new design. Generate one complete, unified image.`;

    let prompt = "";
    let strength = 0.65;

    if (customPrompt && customPrompt.trim() !== "") {
      // Пользовательский режим
      prompt = `${customPrompt}. ${baseConstraints} Design a complete room as one unified space, maintaining the original wall structure while being creative with furniture and decor.`;
      strength = 0.6;
    } else {
      // Шаблонный режим
      let designPrompt = `Create a cohesive ${theme.toLowerCase()} style ${room.toLowerCase()}`;
      
      if (architecture && architecture !== "None") {
        designPrompt += ` with ${architecture.toLowerCase()} architectural details`;
      }
      
      if (colorPalette && colorPalette !== "None") {
        designPrompt += ` using ${colorPalette.toLowerCase()} color scheme`;
      }

      if (userPrompt && userPrompt.trim() !== "") {
        designPrompt += `. Additional requirements: ${userPrompt}`;
      }

      prompt = `${designPrompt}. ${baseConstraints} Create one harmonious space that transforms the interior while preserving the original architecture.`;
      strength = 0.65;
    }

    console.log('2. Generated prompt:', prompt);
    console.log('3. Using strength:', strength);

    try {
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        },
        body: JSON.stringify({
          version: "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
          input: {
            prompt,
            image: imageUrl,
            strength: strength,
            guidance_scale: scale ? parseFloat(scale) : 8.5,
            num_inference_steps: 30,
            image_resolution: "768",
            detect_resolution: 768
          },
        }),
      });

      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response:", errorData);
        try {
          const jsonError = JSON.parse(errorData);
          return NextResponse.json(
            { error: jsonError.error || "Failed to generate image" },
            { status: response.status }
          );
        } catch (parseError) {
          return NextResponse.json(
            { error: errorData || "Failed to generate image" },
            { status: response.status }
          );
        }
      }

      const jsonResponse = await response.json();
      let endpointUrl = jsonResponse.urls.get;
      let generatedImage: string | null = null;

      // Polling for result
      while (!generatedImage) {
        console.log("Polling for result...");
        const finalResponse = await fetch(endpointUrl, {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
          },
        });
        
        if (!finalResponse.ok) {
          const errorData = await finalResponse.text();
          console.error("Polling Error Response:", errorData);
          return NextResponse.json(
            { error: "Failed to get generation result" },
            { status: finalResponse.status }
          );
        }

        const jsonFinalResponse = await finalResponse.json();

        if (jsonFinalResponse.status === "succeeded") {
          generatedImage = jsonFinalResponse.output;
          break;
        } else if (jsonFinalResponse.status === "failed") {
          console.error("Generation failed:", jsonFinalResponse.error);
          return NextResponse.json(
            { error: "Image generation failed" },
            { status: 500 }
          );
        }
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return NextResponse.json({ image: generatedImage });
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { error: "Failed to process request" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("General Error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
}
