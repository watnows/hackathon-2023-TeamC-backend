import OpenAI from "openai";
import dotenv from "dotenv";
import translate, {DeeplLanguages} from 'deepl';


require('dotenv').config();

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

function translateByDeepl(content: string): string {
    let text_ja = '';　　//ここに出力する日本語を格納する

    const key = process.env.DEEPL_API_KEY;
    if (!key) {
        throw new Error("DEEPL_API_KEY is not set.");
    }

    translate({
        free_api: true,
        text: content,
        target_lang: 'EN',
        auth_key: key
    }).then(result => {
        text_ja = result.data.translations[0].text; //Deeplで翻訳された文章をtext_ja変数に格納
        console.log(text_ja);
    }).catch(error => {
        console.error(error)
    });

    return text_ja
}

export async function ask(content: string, name?: string, targetCompany?: string) {
    let translatedTxt = translateByDeepl(content);

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 1,
        messages: [
            {
                role: "user",
                content: content
            }, {
                role: "system",
                content: "You are a Japanese student, a Japanese job hunter and can send polite emails to Japanese companies."
            }, {
                role: "user",
                content: "Please write your japanese polite e-mail in Japanese with no spaces."
            }, {
                role: "system",
                content: "Your name is " + name + ".　The company you are sending the email to is " + targetCompany + "."
            }, {
                role: "system",
                content: "「敬具」と「拝啓」は書く必要がありません。."
            }
        ]
    });

    const answer = response.choices[0].message?.content;
    console.log(answer);
}

const question = "インターンシップのお礼のメールを作ってください";
ask(question, "高山隼", "Watnow");