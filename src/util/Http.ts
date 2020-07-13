const server = 'http://192.168.0.45:3000';

export const post = (url: string, body: any, callback: (data: any) => void) => {
    fetch(server + url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then((response) => response.json())
    .then((data: any) => {
        callback(data);
    });
}
