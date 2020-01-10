### depends

tools.parseByFormidable

### intro

http服务，提供常用功能：staticServer，post请求解析，自定义api

自定义api：/api/test，能处理常用的get, post请求；支持文件上传。

### files

├── README.md
├── api
│   ├── assist.js
│   └── test.js
├── assets
│   ├── css
│   │   ├── test.css
│   │   └── test.scss
│   ├── files
│   ├── imgs
│   │   └── gnu-icon-small.png
│   ├── js
│   │   ├── common.js   // utils/commons.js
│   │   ├── fe.js       // utils/fe.js
│   │   ├── xhr-2.js    // 参考axios/adapter/xhr.js实现的，机构清晰，功能全面
│   │   └── xhr.js      // 老xhr，将会被替换
│   └── test.html       // 展示ajax的基本功能
├── config.js
├── index.js
└── test
    └── client.js



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