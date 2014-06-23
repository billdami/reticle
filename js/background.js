var ReticleBg = {
    load: function(tabId) {
        chrome.tabs.insertCSS(tabId, {file: 'css/content.css'}, function(){
            chrome.tabs.executeScript(tabId, {file: 'js/content.js'}, function(result) {
                ReticleBg.activate(tabId);
            });
        });
    },

    activate: function(tabId) {
        chrome.tabs.sendMessage(tabId, {
            action: 'activate',
            settings: ReticleBg.getSettings()
        }, function(response) {
            ReticleBg.toggleButtonState(true, tabId);
        });
    },

    deactivate: function(tabId) {
        chrome.tabs.sendMessage(tabId, {action: 'deactivate'}, function(response) {
            ReticleBg.toggleButtonState(false, tabId);
        });
    },

    getSettings: function() {
        return {
            overlayOpacity: isNaN(parseFloat(localStorage.getItem('overlayOpacity'))) ? 0.4 : parseFloat(localStorage.getItem('overlayOpacity')),
            primaryHex: localStorage.getItem('primaryHex') || '#000000',
            altHex: localStorage.getItem('altHex') || '#C4E2FA',
            overlayBg: localStorage.getItem('overlayBg') || 'primary'
        };
    },

    saveSettings: function(settings) {
        for(var prop in settings) {
            if(settings.hasOwnProperty(prop)) {
               localStorage.setItem(prop, settings[prop]);
            }
        }
    },

    toggleButtonState: function(active, tabId) {
        chrome.browserAction.setIcon({
            tabId: tabId,
            path: {
                '19': 'images/browser-action' + (active ? '-on' : '') + '-19.png',
                '38': 'images/browser-action' + (active ? '-on' : '') + '-38.png',
            }
        });

        chrome.browserAction.setTitle({
            title: (active ? 'Disable' : 'Enable') + ' Reticle',
            tabId: tabId
        });
    },

    browserAction: function(tab) {
        chrome.tabs.executeScript(tab.id, {
            code: 'chrome.runtime.sendMessage({' + 
                'action: "check-state", ' + 
                'loaded: window.hasOwnProperty("__Reticle"), ' + 
                'active: window.hasOwnProperty("__Reticle") && window.__Reticle.active' +
            '})'
        });
    },

    handleMessage: function(request, sender, sendResponse) {
        var tabId = sender.tab && sender.tab.id;

        switch(request.action) {
            case 'check-state':
                ReticleBg[!request.loaded ? 'load' : (request.active ? 'deactivate' : 'activate')](tabId);
                break;
            case 'deactivate':
                if(tabId) ReticleBg.deactivate(tabId);
                break;
            case 'load-settings':
                sendResponse({settings: ReticleBg.getSettings()});
                break;
            case 'save-settings':
                if(request.settings) ReticleBg.saveSettings(request.settings);
                break;
        }
    }
};

//browser action click handler
chrome.browserAction.onClicked.addListener(ReticleBg.browserAction);

//message handler
chrome.runtime.onMessage.addListener(ReticleBg.handleMessage);