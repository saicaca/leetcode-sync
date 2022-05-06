function getToken() {
    return chrome.cookies.get({
        "name": "csrftoken",
        "url": "https://leetcode.com/"
    })
}

async function sendRequest(url, originalBody) {
    const tokenStr = (await getToken()).value
    fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'x-csrftoken': tokenStr,
        },
        body: originalBody
    }).catch(error => console.log('Error: ' + error))
}

async function addRequestListener() {
    let callback = function (details) {
        console.log(details)
        let url = details.url
        let requestBody = decodeURIComponent(String.fromCharCode.apply(
            null, new Uint8Array(details.requestBody.raw[0].bytes))
        )
        let newUrl = url.replace("leetcode-cn.com", "leetcode.com")
        sendRequest(newUrl, requestBody)
    }
    let filter = {
        "urls": ["https://leetcode-cn.com/problems/*/submit/"]
    }
    let opt_extraInfoSpec = ['requestBody']
    chrome.webRequest.onBeforeRequest.addListener(
        callback, filter, opt_extraInfoSpec
    )
    console.log("LeetCode webRequest listener ready")
}

addRequestListener().catch(error => console.log('Error: ' + error))