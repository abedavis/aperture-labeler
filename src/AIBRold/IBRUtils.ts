
export async function loadJSONFromURL(url: string) {
    let data = "";
    return await fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            data = myJson;
            return myJson;
        });
}
