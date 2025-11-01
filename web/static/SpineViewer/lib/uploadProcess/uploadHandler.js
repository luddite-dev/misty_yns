import formAwaiter from "./formAwaiter.js";
import { appendUserSort } from './appendUserSort.js';
import { orgernize } from './orgernize.js';
import DragHandler from "./draghandler.js";
import autoLoader from "./autoLoader.js";

export default async function uploadHandler(form) {
    const autoLoadedData = await autoLoader();
    
    console.log('[uploadHandler] autoLoadedData:', autoLoadedData);
    
    if (autoLoadedData && autoLoadedData.files && autoLoadedData.files.length > 0) {
        const dataTransfer = new DataTransfer();
        autoLoadedData.files.forEach(file => dataTransfer.items.add(file));
        form.querySelector('input[type="file"]').files = dataTransfer.files;
        form.classList.add('hide');
        document.forms[1].classList.add('hide');
        
        console.log('[uploadHandler] Processing autoLoaded files...');
        const result = await orgernize({ chrs: autoLoadedData.files, back: [] });
        
        console.log('[uploadHandler] orgernize result:', result);
        console.log('[uploadHandler] animationSequences available:', autoLoadedData.animationSequences);
        
        if (autoLoadedData.animationSequences && result.chr) {
             for (let [modelKey, model] of Object.entries(result.chr)) {
                 console.log('[uploadHandler] Processing model:', modelKey, model.name);
                 if (autoLoadedData.animationSequences[model.name]) {
                     console.log('[uploadHandler] Found animation sequence for', model.name, ':', autoLoadedData.animationSequences[model.name]);
                     model.animationSequence = autoLoadedData.animationSequences[model.name];
                 } else {
                     console.log('[uploadHandler] No animation sequence found for', model.name);
                 }
             }
         }
         
         if (result.chr) {
             for (let [modelKey, model] of Object.entries(result.chr)) {
                 model.hasAnimationConfig = autoLoadedData.hasAnimationConfig;
             }
         }
        
        console.log('[uploadHandler] Final result:', result);
        return result;
    }

    new DragHandler('input[type="file"]', '#preview', '.upload-box', {
        dragover: function (e) {
            e.preventDefault();
            this.style.backgroundColor = 'green';
        },
        dragleave: function () {
            this.style.removeProperty('background-color');
        }
    });

    return formAwaiter(form)
        .then(appendUserSort)
        .then(orgernize);
}