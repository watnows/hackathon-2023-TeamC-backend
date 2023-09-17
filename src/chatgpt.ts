import OpenAI from "openai";
import translate from 'deepl';

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

export async function ask(content: string, name?: string, targetCompany?: string, contactPersonName?: string) {
    // let translatedTxt = translateByDeepl(content);

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        top_p: 0.7,
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
                content: "Your name is " + name + ".　You send an email to " + contactPersonName + " belonging in " + targetCompany + "."
            }
        ]
    });

    const answer = response.choices[0].message?.content;
    let adjustedAnswer = '';

    if (answer) {
        adjustedAnswer = adjustAnswer(answer);
    }

    console.log(adjustedAnswer);
    return adjustedAnswer;
}

function adjustAnswer(str: string): string {
    let newStr = str.replace(/拝啓(、|　| )*/g, '');
    newStr = newStr.replace(/敬具(、|　| )*/g, '');
    newStr = newStr.replace(/\n{2}/g, '\n');
    return newStr;
}
