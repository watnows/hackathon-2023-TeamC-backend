import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config({path: "../.env"});

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export async function ask(content: string, model = "gpt-3.5-turbo") {
    const response = await openai.chat.completions.create({
        model: model,
        messages:
            [{
                role: "user",
                content: content
            }, {
                role: "system",
                content: "You are a Japanese job hunter and can send polite emails to Japanese companies."
            }, {
                role: "user",
                content: "Please write your polite e-mail in Japanese."
            }]
    });

    const answer = response.choices[0].message?.content;
    console.log(answer);
}

const question = "";
ask(question);