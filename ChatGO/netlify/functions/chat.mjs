export default async (req) => {

    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({
                error: "Method not allowed"
            }),
            {
                status: 405,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    try {

        const body = await req.json();
        const message = body.message;

        if (!message || typeof message !== "string") {
            return new Response(
                JSON.stringify({
                    error: "Message is required"
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const GROQ_API_KEY =
            process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            return new Response(
                JSON.stringify({
                    error: "GROQ_API_KEY is not configured."
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${GROQ_API_KEY}`
                },

                body: JSON.stringify({

                    model: "openai/gpt-oss-20b",

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are ChatGO, a helpful, intelligent and friendly AI assistant. Give clear and accurate answers. Keep simple questions concise. For technical questions, provide useful explanations and examples."
                        },

                        {
                            role: "user",
                            content: message
                        }
                    ],

                    temperature: 0.7,
                    max_tokens: 2048
                })
            }
        );

        const data =
            await groqResponse.json();

        if (!groqResponse.ok) {
            console.error("Groq error:", data);

            return new Response(
                JSON.stringify({
                    error:
                        data?.error?.message ||
                        "Groq API request failed."
                }),
                {
                    status: groqResponse.status,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }

        const answer =
            data?.choices?.[0]
                ?.message
                ?.content;

        if (!answer) {
            return new Response(
                JSON.stringify({
                    error:
                        "Groq returned an empty response."
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }

        return new Response(
            JSON.stringify({
                response: answer
            }),
            {
                status: 200,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    } catch (error) {

        console.error(
            "Function error:",
            error
        );

        return new Response(
            JSON.stringify({
                error:
                    "Something went wrong on the server."
            }),
            {
                status: 500,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );
    }
};