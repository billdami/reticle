var ReticleSettings = {
    activeTab: 'settings',

    init: function() {
        var me = ReticleSettings;
        me.tabList = document.getElementById('tabs');
        me.contentCt = document.getElementById('tab-content-ct');
        me.opacityInput = document.getElementById('overlay-opacity');
        me.primHexInput = document.getElementById('primary-hex');
        me.altHexInput = document.getElementById('alt-hex');
        me.hideSizeInput = document.getElementById('hide-size');

        chrome.runtime.sendMessage({action: 'load-settings'}, function(response) {
            me.opacityInput.value = response.settings.overlayOpacity.toFixed(1);
            me.primHexInput.value = response.settings.primaryHex;
            me.altHexInput.value = response.settings.altHex;
            me.hideSizeInput.checked = response.settings.hideSize;
        });

        me.opacityInput.addEventListener('change', function(e) {
            me.save({overlayOpacity: parseFloat(me.opacityInput.value)});
        });

        me.primHexInput.addEventListener('change', function(e) {
            me.save({primaryHex: me.primHexInput.value});
        });

        me.altHexInput.addEventListener('change', function(e) {
            me.save({altHex: me.altHexInput.value});
        });

        me.primHexInput.addEventListener('keyup', function(e) {
            me.save({primaryHex: me.primHexInput.value});
        });

        me.altHexInput.addEventListener('keyup', function(e) {
            me.save({altHex: me.altHexInput.value});
        });

        me.hideSizeInput.addEventListener('change', function(e) {
            me.save({hideSize: me.hideSizeInput.checked});
        });

        for(var i=0; i < me.tabList.childNodes.length; i++) {
            if(me.tabList.childNodes[i].tagName === 'LI') {
                me.tabList.childNodes[i].addEventListener('click', function(e) {
                    me.openTab(e.target.id.replace('tab-', ''));
                });
            }
        }
    },

    openTab: function(tab) {
        var selectedTab = this.tabList.querySelector('.active'),
            selectedContent = this.contentCt.querySelector('.active'),
            newTab = document.getElementById('tab-' + tab),
            newContent = document.getElementById('tab-content-' + tab);

        if(tab === this.activeTab && !newTab || !newContent) return;
        if(selectedTab) selectedTab.classList.remove('active');
        if(selectedContent) selectedContent.classList.remove('active');
        newTab.classList.add('active');
        newContent.classList.add('active');
        this.activeTab = tab;
    },

    save: function(settings) {
        chrome.runtime.sendMessage({
            action: 'save-settings', 
            settings: settings
        });
    }
};

document.addEventListener('DOMContentLoaded', ReticleSettings.init);