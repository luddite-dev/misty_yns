import formAwaiter from "./formAwaiter.js";
import { appendUserSort } from './appendUserSort.js';
import { orgernize } from './orgernize.js';
import DragHandler from "./draghandler.js";
import autoLoader from "./autoLoader.js";

export default async function uploadHandler(form) {
    const autoLoadedData = await autoLoader();
    
    console.log('[uploadHandler] autoLoadedData:', autoLoadedData);
    
    if (autoLoadedData && autoLoadedData.files && autoLoadedData.files.length > 0) {
        
        console.log('[uploadHandler] Processing autoLoaded files...');
        const result = await orgernize({ chrs: autoLoadedData.files, back: [] });
        
        console.log('[uploadHandler] orgernize result:', result);
        console.log('[uploadHandler] animationSequences available:', autoLoadedData.animationSequences);
        
        // Ensure result has chr property
        if (!result.chr) {
            result.chr = {};
        }
        if (!result.back) {
            result.back = {};
        }
        
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

    // Only set up drag/drop if we have a form
    if (!form) {
        console.error('No form available and no auto-loaded data');
        return null;
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
