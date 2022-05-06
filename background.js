let tabId = 0

function getToken() {
    return chrome.cookies.get({
        "name": "csrftoken",
        "url": "https://leetcode.com/"
    })
}

async function sendStatus(status) {
    chrome.tabs.sendMessage(tabId, {
        "status": status
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
    })
        .then(response => {
            if(response.status === 200)
                sendStatus("success")
            else
                sendStatus("fail")
        })
        .catch(error => {
            sendStatus("fail")
            console.log('Error: ' + error)
        })
}

async function addRequestListener() {
    let callback = function (details) {
        console.log(details)
        tabId = details.tabId
        sendStatus("sending")
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