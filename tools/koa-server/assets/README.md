### intro

展示ajax的基本功能

```
```

## XMLHttpRequest

### ref

[MDN XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)

### readstatechange

UNSENT            0     open()尚未使用
OPENED            1     open()已调用
HEADERS_RECEIVED  2     收到头部信息
LOADING           3     接收到响应主体
DONE              4     响应完成

### responseType

```
""
An empty responseType string is treated the same as "text", the default type.
arraybuffer
The response is a JavaScript ArrayBuffer containing binary data.
blob
The response is a Blob object containing the binary data.
document
The response is an HTML Document or XML XMLDocument, as appropriate based on the MIME type of the received data. See HTML in XMLHttpRequest to learn more about using XHR to fetch HTML content.
json
The response is a JavaScript object created by parsing the contents of received data as JSON.
text
The response is a text in a DOMString object.
```