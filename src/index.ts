import express from 'express'
import {ask} from "./chatgpt";
import bodyParser from 'body-parser';
import morgan from 'morgan';

import {formatTimestamp, dateValidation, UnixTimestamp} from "./dateUtil";

const app: express.Express = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.json());
app.use(morgan('combined'));


//CROS対応（というか完全無防備：本番環境ではだめ絶対）
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*")
    res.header("Access-Control-Allow-Headers", "*");
    next();
})

app.listen(3000, () => {
    console.log("Start on port 3000.");
})

// 日程調節
type AdjustScheduleRequestType = {
    new_date: [{
        start_date: UnixTimestamp,
        end_date: UnixTimestamp
    }],
    past_date: {
        start_date: UnixTimestamp,
        end_date: UnixTimestamp
    },
    company: string,
    contact_person_name: string,
    name: string,
    reason: string
}
app.post('/api/adjust-schedule', async (req: express.Request, res: express.Response) => {

    const data = req.body;
    // 型チェック
    if (!data.new_date || !data.past_date || !data.company || !data.name || !data.reason || !data.contact_person_name
        || data.new_date.length <= 0 || !data.past_date.start_date || !data.past_date.end_date) {
        console.log("Request Body is the bellow\n*********\n" + req.body);
        console.log(!data.new_date, !data.past_date, !data.company, !data.name, !data.reason
            , data.new_date.length <= 0, !data.past_date.start_date, !data.past_date.end_date)
        res.status(400).send({message: "Bad Request　パラメータが足りません。"});
        return;
    } else if (typeof data.company !== "string" || typeof data.name !== "string" || typeof data.contact_person_name !== "string"
        || typeof data.reason !== "string" || !dateValidation(data.new_date)
        || typeof data.past_date.start_date !== "number" || typeof data.past_date.end_date !== "number") {
        res.status(400).send({message: "Bad Request　パラメータの型が違います。"});
        return;
    }

    const requestBody: AdjustScheduleRequestType = {
        new_date: data.new_date,
        past_date: data.past_date,
        company: data.company,
        contact_person_name: data.contact_person_name,
        name: data.name,
        reason: data.reason
    }

    // 新しい日程の配列を文字列に変化
    let newDateStr = "";
    for (let i = 0; i < requestBody.new_date.length; i++) {
        newDateStr = newDateStr + formatTimestamp(requestBody.new_date[i].start_date) + "から" + formatTimestamp(requestBody.new_date[i].end_date);
        if (i === requestBody.new_date.length - 1) {
            if (requestBody.new_date.length !== 1) {
                newDateStr = newDateStr + "のいずれか";
            }
        } else {
            newDateStr = newDateStr + "、もしくは";
        }

    }

    requestBody.new_date.forEach((date) => {
        newDateStr = newDateStr + formatTimestamp(date.start_date) + "から" + formatTimestamp(date.end_date) + "、";
    })

    const question = "日程調節のメールの本文を作成してください。もともとの日程は" + formatTimestamp(requestBody.past_date.start_date) + "から" + formatTimestamp(requestBody.past_date.end_date) + "でした。新しい日程は" + newDateStr + "を提案してください。変更する理由は" + requestBody.reason + "です";

    const result = await ask(question, requestBody.name, requestBody.company, requestBody.contact_person_name);

    res.send(JSON.stringify({title: "日程調節のお願い", content: result}));
})

// お詫び
type ApologyRequestType = {
    company: string,
    contact_person_name: string,
    name: string,
    what: string,
    situation: string
}
app.post('/api/apology', async (req: express.Request, res: express.Response) => {
    const data = req.body;
    // 型チェック
    if (!data.company || !data.name || !data.situation || !data.contact_person_name || !data.what) {
        console.log("Request Body is the bellow\n*********\n" + req.body);
        res.status(400).send({message: "Bad Request　パラメータが足りません。"});
        return;
    } else if (typeof data.company !== "string" || typeof data.name !== "string" || typeof data.contact_person_name !== "string"
        || typeof data.situation !== "string" || typeof data.what !== "string") {
        res.status(400).send({message: "Bad Request　パラメータの型が違います。"});
        return;
    }

    const requestBody: ApologyRequestType = {
        company: data.company,
        contact_person_name: data.contact_person_name,
        name: data.name,
        what: data.what,
        situation: data.situation
    }


    const question = requestBody.what + "に関して、" + requestBody.situation + "という状況が発生したため、迷惑をかけてしまったので、謝罪のメールの本文を作成してください。";

    const result = await ask(question, requestBody.name, requestBody.company, requestBody.contact_person_name);
    res.send(JSON.stringify({title: requestBody.what + "に関するお詫び", content: result}));
})

// 内定辞退
type RefusalRequestType = {
    company: string,
    contact_person_name: string,
    name: string,
    reason: string,
}
app.post('/api/refusal', async (req: express.Request, res: express.Response) => {
    const data = req.body;
    // 型チェック
    if (!data.company || !data.name || !data.contact_person_name || !data.reason) {
        console.log("Request Body is the bellow\n*********\n" + req.body);
        res.status(400).send({message: "Bad Request　パラメータが足りません。"});
        return;
    } else if (typeof data.company !== "string" || typeof data.name !== "string"
        || typeof data.contact_person_name !== "string" || typeof data.reason !== "string") {
        res.status(400).send({message: "Bad Request　パラメータの型が違います。"});
        return;
    }

    const requestBody: RefusalRequestType = {
        company: data.company,
        contact_person_name: data.contact_person_name,
        name: data.name,
        reason: data.reason
    }


    const question = requestBody.reason + "のため、内定辞退をしたいため、その旨と謝罪の意を伝えるメールの本文を作成してください。";

    const result = await ask(question, requestBody.name, requestBody.company, requestBody.contact_person_name);
    res.send(JSON.stringify({title: "内定辞退のご連絡", content: result}));
})

// 内定受託
type ReceiveOfferRequestType = {
    company: string,
    contact_person_name: string,
    name: string,
}
app.post("/api/receive_offer", async (req: express.Request, res: express.Response) => {
    const data = req.body;
    // 型チェック
    if (!data.company || !data.name || !data.contact_person_name) {
        console.log("Request Body is the bellow\n*********\n" + req.body);
        res.status(400).send({message: "Bad Request　パラメータが足りません。"});
        return;
    } else if (typeof data.company !== "string" || typeof data.name !== "string" || typeof data.contact_person_name !== "string") {
        res.status(400).send({message: "Bad Request　パラメータの型が違います。"});
        return;
    }

    const requestBody: ReceiveOfferRequestType = {
        company: data.company,
        contact_person_name: data.contact_person_name,
        name: data.name
    }

    const question = "内定を受ける旨と内定を渡したことに対するお礼の旨を記載したメールの本文を作成してください。";
    const result = await ask(question, requestBody.name, requestBody.company, requestBody.contact_person_name);

    res.send(JSON.stringify({title: "内定のお礼", content: result}));
})

// お礼
type ThankRequestType = {
    company: string,
    contact_person_name: string,
    why: string,
    name: string
}
app.post("/api/thank", async (req: express.Request, res: express.Response) => {
    const data = req.body;
    if (!data.company || !data.contact_person_name || !data.why || !data.name) {
        console.log("Request Body is the bellow\n*********\n" + req.body);
        res.status(400).send({message: "Bad Request　パラメータが足りません。"});
        return;
    } else if (typeof data.company !== "string" || typeof data.contact_person_name !== "string" || typeof data.why !== "string" || typeof data.name !== "string") {
        res.status(400).send({message: "Bad Request　パラメータの型が違います。"});
        return;
    }

    const requestBody: ThankRequestType = {
        company: data.company,
        contact_person_name: data.contact_person_name,
        why: data.why,
        name: data.name
    }

    const question = requestBody.why + "のため、お礼のメールの本文を作成してください。";

    const result = await ask(question, requestBody.name, requestBody.company, requestBody.contact_person_name);
    res.send(JSON.stringify({title: requestBody.why + "に関するお礼", content: result}));
})
