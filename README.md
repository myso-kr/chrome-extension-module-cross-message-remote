# cem-cross-message-remote

Chrome Extension Cross-Message :

 * Remote (socket.io)
 * Background
 * Sideground (content-script)
 * Foreground (inject-script)

## RemoteModule Class

### constructor(url_pattern: String, options: Object)
```javascript
class ExampleModule extends chrome.runtime.RemoteModule {
  constructor() {
    // options = { remote: String, foreground: Boolean }
    super("https://www.google.*/*", {
      remote: 'ws://example.com:8080/',
      foreground: false
    });
  }
  /* ... */
}
```

### cast(action: String, ...args: Object[])

### emit(action: String, ...args: Object[])

### on(action: String, callback: Function)

### onCreate(href: String)
```javascript
class ExampleModule extends chrome.runtime.RemoteModule {
  /* ... */
  onCreate(href) {
    if(chrome.runtime.background) console.info("Background Start !");
    if(chrome.runtime.sideground) console.info("Sideground Start !");
    if(chrome.runtime.foreground) console.info("Foreground Start !");
  }
  /* ... */
}
```

### onMessage(action: String, data: Object, from: String)
```javascript
class ExampleModule extends chrome.runtime.RemoteModule {
  /* ... */
  onMessage(action, data, from) {
    // from = "remote", "background", "sideground", "foreground"
    console.info(from, action, data);
  }
  /* ... */
}
```

### onForeground(href: String)
```javascript
class ExampleModule extends chrome.runtime.RemoteModule {
  /* ... */
  onForeground(href) {
    // Only Foreground Workflow
  }
  /* ... */
}
```

### onSideground(href: String)
```javascript
class ExampleModule extends chrome.runtime.RemoteModule {
  /* ... */
  onSideground(href) {
    // Only Sideground Workflow
  }
  /* ... */
}
```

### onBackground(href: String)
```javascript
class ExampleModule extends chrome.runtime.RemoteModule {
  /* ... */
  onBackground(href) {
    // Only Background Workflow
  }
  /* ... */
}
```


## Example

### Client
```javascript
import 'chrome-extension-module-cross-message-remote';

chrome.runtime.attach(class ExampleModule extends chrome.runtime.RemoteModule {
  constructor() {
    super('https://*.google.*/*', {
      remote: 'ws://localhost:8080/'
    });
  }
  
  onSideground(href) {
    // Sideground <> Background CM
    this.cast("background.actionA", 1);
    this.on("sideground.actionA", (value) => {
      // value = 2;
    });
  }
  
  onBackground(href) {
    // Background <> Sideground CM
    this.on("background.actionA", (value) => {
      // value = 1;
      this.cast("sideground.actionA", value + 1);
    });
    // Remote Messaging
    this.cast("remote.actionA", 1);
    this.on("background.actionB", (value) => {
      // value = 2;
    });
  }
})
```

### Server
```javascript
const io = require('socket.io');

const server = io(8080);
server.on('connection', (socket) => {
  socket.on('onMessage', (detail) => {
    const { action, data, from, name, sender } = detail;
    switch(action) {
    case 'remote.actionA':
      // data = 1;
      socket.emit('onMessage', {
        name, sender, // Required
        action: 'background.actionB',
        data: data + 1
      });
      break;
    }
  });
});
```