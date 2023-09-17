type UnixTimestamp = number;

function formatTimestamp(timestamp: UnixTimestamp): string {
    const date = new Date(timestamp * 1000);

    // 月と日を取得
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 曜日を取得
    const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
    const dayOfWeek = daysOfWeek[date.getDay()];

    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let formattedTime = String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0');

    return `${month}/${day}(${dayOfWeek}) ${formattedTime}`;
}

function dateValidation(dates: any): boolean {
    let result = true;

    for (const date of dates) {
        if (!date.start_date || !date.end_date || typeof date.start_date !== "number" || typeof date.end_date !== "number") {
            result = false;
            break;
        }
    }

    return result;
}

export {formatTimestamp, dateValidation, UnixTimestamp}
