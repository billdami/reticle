window.__Reticle = {
    active: false,
    dragStartX: null,
    dragStartY: null,
    draggingMask: false,
    draggingOverlay: false,
    draggingHandle: false,
    overlayVisible: false,
    overlayX: 0,
    overlayY: 0,
    overlayW: 0,
    overlayH: 0,
    infoH: 33,
    doc: null,
    listeners: [],
    els: {},

    createEl: function(type, id, classes, appendTo) {
        var el = this.doc.createElement('div');
        appendTo = appendTo || this.doc.body;
        if(id) el.id = id;
        if(classes) el.className = classes;
        appendTo.appendChild(el);
        return el;
    },

    removeEl: function(el) {
        if(el instanceof HTMLElement && el.parentNode) {
            el.parentNode.removeChild(el);
        }

        el = null;
    },

    addListener: function(el, type, fn) {
        el.addEventListener(type, fn, false);
        this.listeners.push({
            el: el,
            type: type,
            fn: fn
        });
    },

    removeAllListeners: function() {
        while(this.listeners.length > 0) {
            var listener = this.listeners.pop();
            listener.el.removeEventListener(listener.type, listener.fn, false);
            listener = null;
        }
    },

    setCss: function(el, styles) {
        for(var prop in styles) {
            if(styles.hasOwnProperty(prop)) {
                el.style[prop] = styles[prop];
            }
        }
    },

    showOverlay: function(x, y, w, h) {
        this.overlayW = w;
        this.overlayH = h;
        this.overlayX = x;
        this.overlayY = y;
        this.overlayVisible = true;

        this.setCss(this.els.overlay, {
            display: 'block',
            width: w + 'px',
            height: h + 'px',
            top: y + 'px',
            left: x + 'px'
        });

        this.updateInfoText();
        this.updateInfoPos();
        this.updateHandles();
    },

    hideOverlay: function() {
        this.overlayW = 0;
        this.overlayH = 0;
        this.overlayX = 0;
        this.overlayY = 0;
        this.overlayVisible = false;
        this.setCss(this.els.overlay, {
            display: 'none',
            width: '0',
            height: '0'
        });
    },

    moveOverlay: function(xOffset, yOffset) {
        if(xOffset && xOffset !== 0) {
            this.overlayX = Math.max(this.overlayX + xOffset, 0);
            this.els.overlay.style.left = this.overlayX + 'px';
        }

        if(yOffset && yOffset !== 0) {
            this.overlayY = Math.max(this.overlayY + yOffset, 0);
            this.els.overlay.style.top = this.overlayY + 'px';
        }

        if((yOffset && yOffset !== 0)) {
            this.updateInfoPos();
        }
    },

    resizeOverlay: function(wOffset, hOffset) {
        if(wOffset && wOffset !== 0) {
            this.overlayW = Math.max(this.overlayW + wOffset, 0);
            this.els.overlay.style.width = this.overlayW + 'px';
        }

        if(hOffset && hOffset !== 0) {
            this.overlayH = Math.max(this.overlayH + hOffset, 0);
            this.els.overlay.style.height = this.overlayH + 'px';
        }

        if((wOffset && wOffset !== 0) || (hOffset && hOffset !== 0)) {
            this.updateInfoText();
            this.updateInfoPos();
            this.updateHandles();
        }
    },

    updateOverlayLayout: function(x, y) {
        this.moveOverlay(x < this.dragStartX ? x - this.overlayX : null, y < this.dragStartY ? y - this.overlayY : null);
        this.resizeOverlay(Math.abs(this.dragStartX - x) - this.overlayW, Math.abs(this.dragStartY - y) - this.overlayH);
    },

    updateInfoText: function() {
        if (this.hideSize) {
            this.els.info.style.display = 'none';
            return;
        }
        this.els.info.style.display = (this.overlayW > 0 && this.overlayH > 0) ? 'block' : 'none';
        this.els.info.textContent = this.overlayW + ' x ' + this.overlayH;
        this.els.info.style.marginLeft = '-' + (this.els.info.clientWidth / 2) + 'px';
    },

    updateInfoPos: function() {
        this.els.info.classList[(this.overlayY + this.overlayH + this.infoH) >= window.innerHeight ? 'add' : 'remove']('align-top');
    },

    updateHandles: function() {
        var cornerDisplay = this.overlayW < 8 || this.overlayH < 8 ? 'none' : '',
            xDisplay = this.overlayH < 20 ? 'none' : '',
            yDisplay = this.overlayW < 20 ? 'none' : '';
        this.els.handleTl.style.display = cornerDisplay;
        this.els.handleTr.style.display = cornerDisplay;
        this.els.handleBr.style.display = cornerDisplay;
        this.els.handleBl.style.display = cornerDisplay;
        this.els.handleR.style.display = xDisplay;
        this.els.handleL.style.display = xDisplay;
        this.els.handleT.style.display = yDisplay;
        this.els.handleB.style.display = yDisplay;
    },

    cancelDrag: function() {
        if(this.draggingMask) {
            this.els.handlesCt.classList.add('hover');
        }

        this.draggingMask = false;
        this.draggingOverlay = false;
        this.draggingHandle = false;
        this.els.mask.className = '';
    },

    calcDragPoint: function(x, y) {
        var top = this.overlayY,
            left = this.overlayX,
            w = this.overlayW,
            h = this.overlayH,
            handleSize = 12,
            handleOutset = 8,
            handleInset = handleSize - handleOutset,
            leftEdge = (x >= left - handleOutset && x <= left + handleInset),
            rightEdge = (x >= left + w - handleInset && x <= left + w + handleOutset),
            topEdge = (y >= top - handleOutset && y <= top + handleInset),
            botEdge = (y >= top + h - handleInset && y <= top + h + handleOutset),
            centerX = x >= left + (w / 2) - (handleSize / 2) && x <= left + (w / 2) + (handleSize / 2),
            centerY = y >= top + (h / 2) - (handleSize / 2) && y <= top + (h/2) + (handleSize / 2),
            point = false;

        if(topEdge && leftEdge) {
            point = 'tl';
        } else if(topEdge && centerX) {
            point = 't';
        } else if(topEdge && rightEdge) {
            point = 'tr';
        } else if(rightEdge && centerY) {
            point = 'r';
        } else if(botEdge && rightEdge) {
            point = 'br';
        } else if(botEdge && centerX) {
            point = 'b';
        } else if(botEdge && leftEdge) {
            point = 'bl';
        } else if(leftEdge && centerY) {
            point = 'l';
        }

        return point;
    },

    hexToRgb: function(hex) {
        if(!hex) return {r: 0, g: 0, b: 0};
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {
            r: 0, 
            g: 0, 
            b: 0
        };
    },

    loadSettings: function(settings) {
        this.overlayOpacity = settings.overlayOpacity;
        this.primaryRgb = this.hexToRgb(settings.primaryHex);
        this.altRgb = this.hexToRgb(settings.altHex);
        this.overlayBg = settings.overlayBg;
        this.hideSize = settings.hideSize;
        this.updateOverlayBgCss();
    },

    saveSettings: function(settings) {
        chrome.runtime.sendMessage({
            action: 'save-settings', 
            settings: settings
        });
    },

    adjustOverlayOpacity: function(adjustment) {
        this.overlayOpacity = parseFloat(Math.min(Math.max(this.overlayOpacity + adjustment, 0.1), 1));
        this.updateOverlayBgCss();
        this.saveSettings({overlayOpacity: this.overlayOpacity});
    },

    toggleOverlayBg: function() {
        this.overlayBg = this.overlayBg === 'primary' ? 'alt' : 'primary';
        this.updateOverlayBgCss();
        this.saveSettings({overlayBg: this.overlayBg});
    },

    updateOverlayBgCss: function() {
        this.primaryBg = 'rgba(' + this.primaryRgb.r + ',' + this.primaryRgb.g + ',' + this.primaryRgb.b + ',' + this.overlayOpacity.toFixed(1) + ')';
        this.altBg = 'rgba(' + this.altRgb.r + ',' + this.altRgb.g + ',' + this.altRgb.b + ',' + this.overlayOpacity.toFixed(1) + ')';
        this.els.overlay.style.background = this[this.overlayBg + 'Bg'];
    },

    activate: function(settings) {
        var me = this;
        this.active = true;
        this.doc = window.document;
        this.els.mask = this.createEl('div', 'reticle-mask');
        this.els.overlay = this.createEl('div', 'reticle-overlay', null, this.els.mask);
        this.els.info = this.createEl('div', 'reticle-info', null, this.els.overlay);
        this.els.handlesCt = this.createEl('div', 'reticle-handles', null, this.els.overlay);
        this.els.handleTl = this.createEl('div', 'reticle-handle-tl', 'reticle-handle', this.els.handlesCt);
        this.els.handleT = this.createEl('div', 'reticle-handle-t', 'reticle-handle', this.els.handlesCt);
        this.els.handleTr = this.createEl('div', 'reticle-handle-tr', 'reticle-handle', this.els.handlesCt);
        this.els.handleR = this.createEl('div', 'reticle-handle-r', 'reticle-handle', this.els.handlesCt);
        this.els.handleBr = this.createEl('div', 'reticle-handle-br', 'reticle-handle', this.els.handlesCt);
        this.els.handleB = this.createEl('div', 'reticle-handle-b', 'reticle-handle', this.els.handlesCt);
        this.els.handleBl = this.createEl('div', 'reticle-handle-bl', 'reticle-handle', this.els.handlesCt);
        this.els.handleL = this.createEl('div', 'reticle-handle-l', 'reticle-handle', this.els.handlesCt);
        this.loadSettings(settings);

        this.addListener(this.doc, 'keydown', function(e) {
            switch(e.keyCode) {
                //esc
                case 27:
                    chrome.runtime.sendMessage({action: 'deactivate'});
                    break;
                //tab
                case 9:
                    if(me.overlayVisible) {
                        e.preventDefault();
                        me.toggleOverlayBg();
                    }
                    break;
                //up arrow
                case 38:
                    if(me.overlayVisible) {
                        e.preventDefault();
                        if(e.ctrlKey || e.metaKey) {
                            me.adjustOverlayOpacity(0.1);
                        } else {
                            me[e.altKey ? 'resizeOverlay' : 'moveOverlay'](null, e.shiftKey ? -10 : -1);
                        }
                    }
                    break;
                //down arrow
                case 40:
                    if(me.overlayVisible) {
                        e.preventDefault();
                        if(e.ctrlKey || e.metaKey) {
                            me.adjustOverlayOpacity(-0.1);
                        } else {
                            me[e.altKey ? 'resizeOverlay' : 'moveOverlay'](null, e.shiftKey ? 10 : 1);
                        }
                    }
                    break;
                //left arrow
                case 37:
                    if(me.overlayVisible) {
                        e.preventDefault();
                        me[e.altKey ? 'resizeOverlay' : 'moveOverlay'](e.shiftKey ? -10 : -1, null);
                    }
                    break;
                //right arrow
                case 39:
                    if(me.overlayVisible) {
                        e.preventDefault();
                        me[e.altKey ? 'resizeOverlay' : 'moveOverlay'](e.shiftKey ? 10 : 1, null);
                    }
                    break;
                //backspace
                //delete
                case 8:
                case 46:
                    e.preventDefault();
                    me.hideOverlay();
                    break;
            }
        });

        this.addListener(this.els.mask, 'mousedown', function(e) {
            me.draggingMask = true;
            me.dragStartX = e.pageX - window.scrollX;
            me.dragStartY = e.pageY - window.scrollY;
            me.els.mask.classList.add('dragging-mask');
            me.showOverlay(me.dragStartX, me.dragStartY, 0, 0);
        });

        this.addListener(this.els.mask, 'mousemove', function(e) {
            var newX = e.pageX - window.scrollX,
                newY = e.pageY - window.scrollY;

            if(me.draggingMask) {
                me.updateOverlayLayout(newX, newY);
            } else if(me.draggingOverlay) {
                me.moveOverlay(newX - me.dragOverlayX, newY - me.dragOverlayY);
                me.dragOverlayX = newX;
                me.dragOverlayY = newY;
            } else if(me.draggingHandle) {
                switch(me.draggingHandle) {
                    case 'tl':
                        me.moveOverlay(newX - me.dragOverlayX, newY - me.dragOverlayY);
                        me.resizeOverlay(me.dragOverlayX - newX, me.dragOverlayY - newY);
                        break;
                    case 't':
                        me.moveOverlay(null, newY - me.dragOverlayY);
                        me.resizeOverlay(null, me.dragOverlayY - newY);
                        break;
                    case 'tr':
                        me.moveOverlay(null, newY - me.dragOverlayY);
                        me.resizeOverlay(newX - me.dragOverlayX, me.dragOverlayY - newY);
                        break;
                    case 'r':
                        me.resizeOverlay(newX - me.dragOverlayX, null);
                        break;
                    case 'br':
                        me.resizeOverlay(newX - me.dragOverlayX, newY - me.dragOverlayY);
                        break;
                    case 'b':
                        me.resizeOverlay(null, newY - me.dragOverlayY);
                        break;
                    case 'bl':
                        me.moveOverlay(newX - me.dragOverlayX, null);
                        me.resizeOverlay(me.dragOverlayX - newX, newY - me.dragOverlayY);
                        break;
                    case 'l':
                        me.moveOverlay(newX - me.dragOverlayX, null);
                        me.resizeOverlay(me.dragOverlayX - newX, null);
                        break;
                }

                me.dragOverlayX = newX;
                me.dragOverlayY = newY;
            }
        });

        this.addListener(this.els.mask, 'mouseup', function(e) {
            me.cancelDrag();
        });

        this.addListener(this.els.mask, 'mouseleave', function(e) {
            me.cancelDrag();
        });

        this.addListener(this.els.overlay, 'mousedown', function(e) {
            me.dragOverlayX = e.pageX - window.scrollX;
            me.dragOverlayY = e.pageY - window.scrollY;

            //based on the x/y position initialize resizing or dragging
            me.draggingHandle = me.calcDragPoint(me.dragOverlayX, me.dragOverlayY);

            if(!me.draggingHandle) {
                me.draggingOverlay = true;
                me.els.mask.classList.add('dragging-overlay');
            } else {
                me.els.mask.classList.add('dragging-handle');
                me.els.mask.classList.add('dragging-handle-' + me.draggingHandle);
            }

            e.stopPropagation();
        });

        this.addListener(this.els.handlesCt, 'mouseleave', function(e) {
            me.els.handlesCt.classList.remove('hover');
        });
        
        //if the overlay was visible when the extension was last deactivated, restore its previous layout
        if(this.overlayVisible && this.overlayW > 0 && this.overlayH > 0) {
            this.showOverlay(this.overlayX, this.overlayY, this.overlayW, this.overlayH);
        }
    },

    deactivate: function() {
        this.removeAllListeners();
        this.removeEl(this.els.overlay);
        this.removeEl(this.els.mask);
        this.els = {};
        this.active = false;
    },

    handleMessage: function(request, sender, sendResponse) {
        switch(request.action) {
            case 'activate':
                __Reticle.activate(request.settings);
                break;
            case 'deactivate':
                __Reticle.deactivate();
                break;
        }

        sendResponse({success: true});
    }
};

//message handler
chrome.runtime.onMessage.addListener(__Reticle.handleMessage);
