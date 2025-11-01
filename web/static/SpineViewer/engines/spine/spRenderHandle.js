import SpPopup from "./SpPopup.js";
import bgiContainer from "../../lib/modelClass/bgiContainer.js";
import initializer from "./initializer.js";
import spineModel from "../../lib/modelClass/spineModel.js";

function addTools(handler) {
     const butL = document.querySelector('.spine-player-buttons');
     const spacer = butL.querySelector('.spine-player-button-spacer');
     const render = handler.render;
     
     const animationsButton = document.querySelector('.spine-player-button-icon-animations');
     if (animationsButton) {
         const hasAnimationConfig = handler.model && handler.model.hasAnimationConfig;
         if (hasAnimationConfig) {
             console.log('[spRenderHandle] Removing animations button - animation config in INI, sequences should not be overridden');
             animationsButton.remove();
         } else {
             console.log('[spRenderHandle] Keeping animations button - no animation config, manual selection allowed');
         }
     }
     
     butL.querySelector('.spine-player-button-icon-spine-logo').remove();
     spacer.insertAdjacentHTML('afterend', `<button class="spine-player-button spine-player-button-icon-pma" title="toggle PMA">A</button>`);
     document.querySelector('.spine-player-button-icon-pma').addEventListener('click', ev => {
         ev.preventDefault();
         render.togglePMA();
     })

     const sp = render.config?.soundPlayer;
     if (sp) {
         spacer.insertAdjacentHTML('afterend', `<button class="spine-player-button spine-player-button-icon-voices" title="cv voices"><span class="material-symbols-outlined">
         voice_chat
         </span></button>`);

     }
}

function disposeSubRender(render) {
    if (render.stopRendering) render.stopRendering();
    if (render.dispose) render.dispose();
}

async function spRenderHandle() {
     if (this.render) {
         disposeSubRender(this.render);
         this.containers[0].innerHTML = "";
         this.render = null;
     };

      const renderList = Object.values(this.models);
     
     if (this.backs && this.backs.length != 0) {
         if (this.backs[0] instanceof spineModel) {
             renderList.push(this.backs[0]);
         } else if (this.backs[0] instanceof bgiContainer) {
             let files = this.backs[0].files;
             let f = Array.isArray(files)?files[0]:Object.values(files)[0];
             let isFromZip = f.async != null;
             const u = URL.createObjectURL(isFromZip?await f.async('blob'):f);
             renderList[0] && Object.assign(renderList[0], {
                 backgroundImage: {
                     url: u,
                     x: 0,
                     y: 0,
                 }
             })
         }
     }

     this.soundHandlers = [];
     const firstModel = renderList[0];
     
     this.render = await initializer.call(this, firstModel, true, this.containers, this.notiHandler, this.audios).then(m => {
         this.soundHandlers.push(m.soundPlayer);
         return m.render
     });
     
     this.render.preloadSkeletonFiles(renderList);
     
     const loadingPromise = new Promise(resolve => {
         const checkLoading = () => {
             if (this.render.assetManager.isLoadingComplete()) {
                 this.render.setSkeletonsToRender(renderList);
                 this.render.loadAllSkeletons();
                 resolve();
             } else {
                 requestAnimationFrame(checkLoading);
             }
         };
         checkLoading();
     });
     
     await loadingPromise;
     addTools(this);
}

export default spRenderHandle;