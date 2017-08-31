const FS_SECONDARY_LIST = /https?:\/\/[\w.:@]*\.google\.[a-z\.]{2,6}\/(?:search|images|custom|cse|s)(?:;\S*)?\?\S*/;
const FS_COOLDOWN_MIN = 5000, FS_COOLDOWN_MAX = 80000;
const FS_MESSAGING_HOST = 'app.fs_chrome_https';

var FS_SERVICE_GUID = "";
var FS_SERVICE_PORT = "";
var FS_SERVICE_URL = "";

function logd(text) {
    console.log("[ols] .D " + new Date().toISOString() + " " + logd.caller.name + "() " + text);
}

function loge(text) {
    console.log("[ols] *E " + new Date().toISOString() + " " + loge.caller.name + "() " + text);
}

var tabMap = {};
var injectMap = {};
var cooldown = false;
var cooldownInterval = FS_COOLDOWN_MIN;

function init() {
    try {
        logd("enter");

        chrome.webRequest.onBeforeRequest.addListener(
            webRequestOnBeforeRequest, { urls: ["https://*/*"] }, ["blocking"]);

        chrome.webRequest.onBeforeSendHeaders.addListener(
            webRequestOnBeforeSendHeaders, { urls: ["https://*/*"] }, ["requestHeaders", "blocking"]);

        chrome.tabs.onUpdated.addListener(tabsOnUpdated);
        chrome.tabs.onCreated.addListener(tabsOnCreated);
        chrome.tabs.onRemoved.addListener(tabsOnRemoved);
        chrome.tabs.onReplaced.addListener(tabsOnReplaced);

        chrome.runtime.onMessage.addListener(runtimeOnMessage);

        pingNif();
        initTabs();

        logd("leave");
    } catch (e) {
        loge("failed: " + e);
    }
}

function pingNif() {
    var scanQuery = {
        url: "",
        referer: "",
        rqtype: 0
    };

    sendHttpsscanQuery(scanQuery, true);
    setTimeout(pingNif, 600000);
}

function initTabs() {
    chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            tabMap[tabs[i].id] = {};

            if (tabs[i].url && tabs[i].url.indexOf("https://") == 0)
                chrome.tabs.reload(tabs[i].id);
        }
    });
}

function sendHttpsscanQuery(scanQuery, async) {
    if (cooldown) {
        return null;
    }

    try {
        var srvurl = FS_SERVICE_URL + "/httpsscan";
        var xhr = new XMLHttpRequest();

        xhr.open("POST", srvurl, async);
        xhr.setRequestHeader("Content-Type", "text/plain");

        var content = JSON.stringify(scanQuery);

        logd("sending " + content + " to: " + srvurl);
        xhr.send(content);

        return xhr;
    } catch (e) {
        loge("failed: " + e);
        logd("cooldown for " + cooldownInterval);

        cooldown = true;

        setTimeout(function () {
            cooldown = false;
            logd("cooldown over");
        }, cooldownInterval);

        if (cooldownInterval < FS_COOLDOWN_MAX) {
            cooldownInterval *= 2;
        }

        return null;
    }
}

function handleHttpsscanResponse(xhr) {
    if (xhr == null) {
        return null;
    }

    try {
        var xhrDone = xhr.readyState == 4;

        if (!xhrDone || xhr.status != 200 || !xhr.responseText || !xhr.responseText.length) {
            logd("request status: " + (xhrDone ? xhr.status : xhr.readyState));
            return null;
        }

        var scanResult = JSON.parse(xhr.responseText);
        logd("response got: " + xhr.responseText);

        cooldownInterval = FS_COOLDOWN_MIN;

        return scanResult;
    } catch (e) {
        loge("failed: " + e);
        return null;
    }
}

function webRequestOnBeforeRequest(details) {
    try {
        logd("details: " + JSON.stringify(details));

        if (details.type == "main_frame") {
            return;
        }

        if (!FS_SECONDARY_LIST.test(details.url)) {
            return;
        }

        var scanQuery = {
            url: details.url,
            referer: "",
            rqtype: 2
        };

        var xhr = sendHttpsscanQuery(scanQuery, false);

        var scanResult = handleHttpsscanResponse(xhr);
        if (!scanResult) {
            return;
        }

        if ("redirect" in scanResult) {
            logd("redirect to: " + scanResult.redirect);
            return { redirectUrl: scanResult.redirect };
        } else if ("block" in scanResult) {
            logd("block: " + details.url);
            return { cancel: true };
        }
    } catch (e) {
        loge("failed: " + e);
    }
}

function webRequestOnBeforeSendHeaders(details) {
    try {
        if (details.tabId == -1) {
            return;
        }

        logd("requestId: " + details.requestId);

        if (details.type != "main_frame") {
            return;
        }

        var scanQuery = {
            url: details.url,
            referer: "",
            rqtype: 1
        };

        var preRendering = !(details.tabId in tabMap);

        if (preRendering) {
            // Pre-rendering part 1: process as secondary
            if (FS_SECONDARY_LIST.test(details.url)) {
                logd("Tab " + details.tabId + " not found, scan as rqtype 2");
                scanQuery.rqtype = 2;
            } else {
                logd("Tab " + details.tabId + " not found, skip scanning");
                return;
            }
        }

        for (var i = 0; i < details.requestHeaders.length; i++) {
            if (details.requestHeaders[i].name == "Referer") {
                scanQuery.referer = details.requestHeaders[i].value;
                break;
            }
        }

        var xhr = sendHttpsscanQuery(scanQuery, false);

        var scanResult = handleHttpsscanResponse(xhr);
        if (!scanResult) {
            return;
        }

        if ("redirect" in scanResult) {
            logd("redirect: " + details.tabId + ", url: " + scanResult.redirect);
            chrome.tabs.update(details.tabId, { url: scanResult.redirect });
        } else if ("injectCss" in scanResult && "injectJs" in scanResult) {
            injectMap[details.tabId] = scanResult;
        } else if ("block" in scanResult) {
            logd("block: " + details.url);
            return { cancel: true };
        }
    } catch (e) {
        loge("failed: " + e);
    }
}

function tabsOnUpdated(id, obj) {
    try {
        if (id in injectMap) {
            var scanResult = injectMap[id];
            delete injectMap[id];

            var js = getContent(scanResult.injectJs);
            var css = getContent(scanResult.injectCss);

            logd("inject: " + id);
            chrome.tabs.insertCSS(id, { code: css });
            chrome.tabs.executeScript(id, { code: js });
        }
    } catch (e) {
        loge("failed: " + e);
    }
}

function tabsOnCreated(obj) {
    logd("added: " + obj.id);
    tabMap[obj.id] = {};
}

function tabsOnRemoved(id, obj) {
    logd("removed: " + id);
    delete tabMap[id];
}

function tabsOnReplaced(addedTabId, removedTabId) {
    logd("added: " + addedTabId + " removed: " + removedTabId);

    tabMap[addedTabId] = {};
    delete tabMap[removedTabId];

    // Pre-rendering part 2: re-transmit url as primary
    chrome.tabs.get(addedTabId, function tabsOnReplaced_get(tab) {
        if (!tab || !tab.url) {
            return;
        }

        var scanQuery = {
            url: tab.url,
            referer: "",
            rqtype: 1
        };

        var xhr = sendHttpsscanQuery(scanQuery, true);

        xhr.onreadystatechange = function tabsOnReplaced_onreadystatechange() {
            try {
                if (xhr.readyState != 4)
                    return;

                var scanResult = handleHttpsscanResponse(xhr);
                if (!scanResult) {
                    return;
                }

                if ("redirect" in scanResult) {
                    logd("redirect: " + scanResult.redirect);
                    chrome.tabs.update(addedTabId, { url: scanResult.redirect });
                } else if ("injectCss" in scanResult && "injectJs" in scanResult) {
                    injectMap[addedTabId] = scanResult;
                }
            } catch (e) {
                loge("failed: " + e);
            }
        };
    });
}

function runtimeOnMessage(request, sender, sendResponse) {
    try {
        if (request && request.fsOlsData == FS_SERVICE_URL && request.fsOlsRequest) {
            console.log("Query for: " + request.fsOlsRequest);

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", FS_SERVICE_URL + "/ajax?url_rating=" + request.fsOlsRequest, true);
            xmlhttp.send();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState != 4) {
                    return;
                }

                if (xmlhttp.status == 200) {
                    sendResponse(xmlhttp.responseText);
                } else {
                    sendResponse();
                }
            };
        } else {
            sendResponse();
        }
    } catch (e) {
        loge("failed: " + e);
        sendResponse();
    }

    return true;
}

function getContent(url) {
    try {
        logd("enter: " + url);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send();

        var xhrDone = xhr.readyState == 4;
        logd("leave: " + (xhrDone ? xhr.status : xhr.readyState));

        if (!xhrDone || xhr.status != 200 || !xhr.responseText || !xhr.responseText.length) {
            return;
        }

        return xhr.responseText;
    } catch (e) {
        loge("failed: " + e);
    }
}

function onReceiveNativeMessage(message) {
    logd("Received: " + JSON.stringify(message));

    if (!message || !message.guid || !message.port) {
        loge("Native host reply is invalid");
        return;
    }

    FS_SERVICE_GUID = message.guid;
    FS_SERVICE_PORT = message.port;
    FS_SERVICE_URL = "http://localhost:" + FS_SERVICE_PORT + "/" + FS_SERVICE_GUID;
    logd("FS_SERVICE_URL  : " + FS_SERVICE_URL);

    init();
}

chrome.runtime.sendNativeMessage(FS_MESSAGING_HOST, {}, onReceiveNativeMessage);