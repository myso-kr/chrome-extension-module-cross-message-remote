import 'chrome-extension-module-cross-message';

import _ from 'lodash';
import io from 'socket.io-client';
import EventEmitter from 'events';

chrome.runtime.RemoteModule = class Module extends chrome.runtime.Module {
  constructor(pattern = '*', options = {}) {
    super(pattern, options);
    this.io = (chrome.runtime.background && this.options.remote) ? io(this.options.remote) : new EventEmitter();
    this.io.on('connect', () => this.debug('onRemote'));
    this.io.on('onMessage', (message) => {
      const { action, data, name, sender } = message;
      if(this.constructor.name !== name) return;
      this.emit('onMessage', message, 'remote');
      this.cast(action, data, 'remote', sender);
    });
  }

  cast(action, data, from, tab) {
    const detail = { action, data, name: this.constructor.name };
    switch(true) {
      case chrome.runtime.foreground:
        _.set(detail, 'from', from || 'foreground');
        if(_.eq(detail.from, 'foreground')) document.dispatchEvent(new CustomEvent('sideground.onMessage', { detail }));
      break;
      case chrome.runtime.sideground:
        _.set(detail, 'from', from || 'sideground');
        if(_.eq(detail.from, 'sideground') || _.eq(detail.from, 'foreground')) chrome.extension.sendMessage(detail);
        if(_.eq(detail.from, 'sideground') || _.eq(detail.from, 'background') || _.eq(detail.from, 'remote')) document.dispatchEvent(new CustomEvent('foreground.onMessage', { detail }));
      break;
      case chrome.runtime.background:
        const tabId = _.get(tab, 'tab.id', tab);
        _.set(detail, 'from', from || 'background');
        if(_.eq(detail.from, 'background') || _.eq(detail.from, 'remote')) chrome.tabs.sendMessage(tabId, detail);
        if(_.eq(detail.from, 'background') || _.eq(detail.from, 'sideground') || _.eq(detail.from, 'foreground')) {
          this.io.emit('onMessage', { sender: tabId, ...detail });
        }
      break;
    }
    
  }
}