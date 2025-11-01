import Stats from 'statsjs';
import {
    audioContainer,
    spineModel
} from './lib/modelClass/index.js';

import uploadHandler from "./lib/uploadProcess/uploadHandler.js";
import spRenderHandle from './engines/spine/spRenderHandle.js';
import { notiHandler } from './lib/notiHandler.js';
await new Promise(r => window.onload = () => r(1));

class Renderer {
    constructor(orgernizedObj) {
        this.containers = ['player-container', 'background-container'].map(e => document.querySelector(`#${e}`));
        this.model = null;
        this.render = null;
        this.models = [];
        this.audios = [];
        this.backs = [];
        this.lightConfigs = orgernizedObj.lightConfig ?? null;
        this.soundPlayer = null;
        this.notiHandler = new notiHandler('.sysNotify');
        
        // Safely handle chr property
        const chrObj = orgernizedObj.chr ?? {};
        Object.values(chrObj).forEach(c => {
            switch (true) {
                case c instanceof audioContainer:
                    this.audios.push(c);
                    break;
                default:
                    this.models.push(c);
                    break;
            }
        });
        
        this.backs = Object.values(orgernizedObj.back ?? {});

        this.containers.forEach(e => e.classList.toggle('hide'));
        this.stats = new Stats();
        this.stats.dom.className = "statsjs-container";
        document.body.appendChild(this.stats.dom);
    }

    async changeChar(index) {
        this.notiHandler.clear();
        if (this.models.length === 0) {
            console.error('No models available');
            return;
        }
        
        if (index >= this.models.length || index < 0) {
            console.error(`Invalid model index: ${index}`);
            return;
        }
        
        this.model = this.models[index];
        if (this.model instanceof spineModel) await spRenderHandle.bind(this)();
    }
}

// Check if we have a form (manual upload mode) or should use auto-loader
const form = document.forms[0];
let rendererData;

if (form && form.querySelector('input[type="file"]')) {
    rendererData = await uploadHandler(form);
} else {
    // Auto-load mode - uploadHandler will use autoLoader
    rendererData = await uploadHandler(form);
}

if (!rendererData || (!rendererData.chr || Object.keys(rendererData.chr).length === 0)) {
    console.error('Failed to load any Spine assets');
    // Show error message
    const container = document.querySelector('#player-container');
    if (container) {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:red;font-size:18px;">Failed to load Spine assets. Please check the frameId.</div>';
        container.classList.remove('hide');
    }
} else {
    window.APP = new Renderer(rendererData);
    await APP.changeChar(0);
}
