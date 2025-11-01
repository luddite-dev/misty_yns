import { soundPlayer } from "soundPlayer.js";
import { RecordingManager } from "../../lib/recordingManager.js";

class AnimationSequenceController {
    constructor(model, animationSequence, onSequenceComplete) {
        this.model = model;
        this.sequence = animationSequence || [];
        this.animationIndex = 0;
        this.isPlayingSequence = this.sequence.length > 0;
        this.onSequenceComplete = onSequenceComplete;
        this.currentAnimationStartTime = 0;
        this.currentAnimationTargetDuration = 0;
        this.completeListener = {
            complete: (entry) => this.onAnimationComplete(entry),
            event: () => {},
            start: () => {},
            interrupt: () => {},
            end: () => {},
            dispose: () => {}
        };
        console.log('[AnimationSequenceController] Created for model:', model.name, 'sequence:', this.sequence);
    }

    start() {
        if (this.sequence.length === 0) {
            console.log('[AnimationSequenceController] No sequence to start for', this.model.name);
            return;
        }
        this.animationIndex = 0;
        console.log('[AnimationSequenceController] Starting sequence for', this.model.name);
        this.playNextAnimation();
    }

    onAnimationComplete(entry) {
        if (!this.isPlayingSequence) return;
    }

    playNextAnimation() {
        if (this.animationIndex >= this.sequence.length) {
            console.log('[AnimationSequenceController] Sequence complete for', this.model.name);
            this.isPlayingSequence = false;
            return;
        }

        const currentSeq = this.sequence[this.animationIndex];
        this.currentAnimationTargetDuration = currentSeq.duration;
        this.currentAnimationStartTime = Date.now() / 1000;
        
        if (this.model.animationState && this.model.skeleton) {
            const skeletonData = this.model.skeleton.data;
            const anim = skeletonData.findAnimation(currentSeq.name);
            if (anim) {
                const actualAnimationDuration = anim.duration;
                const shouldLoop = actualAnimationDuration < currentSeq.duration;
                
                console.log('[AnimationSequenceController] Playing animation for', this.model.name, ':', currentSeq.name, 'duration:', currentSeq.duration, 's, actual:', actualAnimationDuration.toFixed(2), 's, loop:', shouldLoop);
                
                this.model.animationState.setAnimationWith(0, anim, shouldLoop);
                
                if (shouldLoop) {
                    this.currentAnimationTargetDuration = currentSeq.duration;
                } else {
                    this.currentAnimationTargetDuration = actualAnimationDuration;
                }
                
                if (!this.listenerAdded) {
                    this.model.animationState.addListener(this.completeListener);
                    this.listenerAdded = true;
                }
            } else {
                console.warn('[AnimationSequenceController] Animation not found:', currentSeq.name);
            }
        }
    }

    checkAnimationProgress() {
        if (!this.isPlayingSequence || this.animationIndex >= this.sequence.length) {
            return;
        }

        const elapsedTime = (Date.now() / 1000) - this.currentAnimationStartTime;
        
        if (elapsedTime >= this.currentAnimationTargetDuration) {
            console.log('[AnimationSequenceController] Animation time exceeded for', this.model.name, 'index', this.animationIndex, 'elapsed:', elapsedTime.toFixed(2), 's');
            this.animationIndex++;
            
            if (this.animationIndex < this.sequence.length) {
                this.playNextAnimation();
            } else {
                console.log('[AnimationSequenceController] Sequence finished for', this.model.name);
                this.isPlayingSequence = false;
                if (this.model.animationState) {
                    this.model.animationState.removeListener(this.completeListener);
                }
                if (this.onSequenceComplete) {
                    this.onSequenceComplete(this.model.name);
                }
            }
        }
    }

    isActive() {
        return this.isPlayingSequence;
    }
}

function selectversions(avers, mv, pathTemp) {
    const spineVers = {};
    avers.map((e, i, a) => {
        let k = Number(e).toFixed(1);
        let k2 = a[i + 1] ? Number(a[i + 1]).toFixed(1) : 'default';

        spineVers[k2] = pathTemp.replace("{ver}", k);
    })
    let versionPath = spineVers.default;

    for (let version in spineVers) {
        if (mv <= parseFloat(version)) {
            versionPath = spineVers[version];
            break;
        }
    }
    return versionPath;
}

export default async function initializer(model, isModel, containers, notiHandler, audios) {
    const versionPath = selectversions([3.7, 3.8, 4.0, 4.1, 4.2], model.version, `./{ver}.js`)
    let spine;
    spine = (await import(versionPath)).spine;

    if (isModel && audios && audios.length != 0) {
        model.soundPlayer = new soundPlayer(model.iniConfig, audios);
        model.soundPlayer.modelName = model.name;
        model.soundPlayer.notiHandle = notiHandler;
        model.soundPlayer.init();
    }

    model.error = (e) => console.error(e);
    const stats = this.stats;
    class CustomSpineRender extends spine.SpinePlayer {
        #prevPgn = null;
        #skeletonsToRender = null;
        #sequenceControllers = null;
        #recordingManager = null;
        #allSequencesStarted = 0;
        #allSequencesCompleted = 0;
        
         preloadSkeletonFiles(skeletons) {
             for (let model of skeletons) {
                 if (model.rawDataURIs) {
                     for (let path in model.rawDataURIs) {
                         this.assetManager.setRawDataURI(path, model.rawDataURIs[path]);
                     }
                 }
                 
                 if (model.jsonUrl) {
                     this.assetManager.loadJson(model.jsonUrl);
                 } else if (model.skelUrl) {
                     this.assetManager.loadBinary(model.skelUrl);
                 }
                 
                 if (model.atlasUrl) {
                     this.assetManager.loadTextureAtlas(model.atlasUrl);
                 }
             }
         }
        
        setSkeletonsToRender(skeletons) {
            console.log('[CustomSpineRender] setSkeletonsToRender called with', skeletons.length, 'skeletons');
            this.#skeletonsToRender = skeletons;
            this.#sequenceControllers = {};
            this.#allSequencesStarted = 0;
            this.#allSequencesCompleted = 0;
            
            const hasAnimationSequences = skeletons.some(m => m.animationSequence && m.animationSequence.length > 0);
            if (hasAnimationSequences && this.canvas) {
                this.#recordingManager = new RecordingManager(this.canvas, 60);
            }
            
            for (let model of skeletons) {
                console.log('[CustomSpineRender] Creating controller for model:', model.name, 'animationSequence:', model.animationSequence);
                this.#sequenceControllers[model.name] = new AnimationSequenceController(
                    model, 
                    model.animationSequence,
                    (modelName) => this.onSequenceComplete(modelName)
                );
            }
        }
        
          loadAllSkeletons() {
              console.log('[CustomSpineRender] loadAllSkeletons called');
              if (!this.#skeletonsToRender || this.#skeletonsToRender.length === 0) return;
              
              for (let model of this.#skeletonsToRender) {
                  console.log('[CustomSpineRender] Loading skeleton for model:', model.name);
                  if (model.skeleton) continue;
                  
                  let skeletonData;
                  const atlasUrl = model.atlasUrl || this.config.atlasUrl;
                  const atlas = this.assetManager.get(atlasUrl);
                  
                  if (!atlas) {
                      console.error("Atlas not found for model " + model.name + ": " + atlasUrl);
                      continue;
                  }
                  
                  if (model.jsonUrl) {
                      var jsonText = this.assetManager.get(model.jsonUrl);
                      var json = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas));
                      try {
                          skeletonData = json.readSkeletonData(jsonText);
                      } catch (e) {
                          console.error("Error loading skeleton " + model.name + ":", e);
                          continue;
                      }
                  } else if (model.skelUrl) {
                      var binaryData = this.assetManager.get(model.skelUrl);
                      var binary = new spine.SkeletonBinary(new spine.AtlasAttachmentLoader(atlas));
                      try {
                          skeletonData = binary.readSkeletonData(binaryData);
                      } catch (e) {
                          console.error("Error loading skeleton " + model.name + ":", e);
                          continue;
                      }
                  } else {
                      continue;
                  }
                  
                  model.skeleton = new spine.Skeleton(skeletonData);
                  var stateData = new spine.AnimationStateData(skeletonData);
                  stateData.defaultMix = this.config.defaultMix || 0.25;
                  model.animationState = new spine.AnimationState(stateData);
                  
                  if (model.skin) {
                      model.skeleton.setSkinByName(model.skin);
                      model.skeleton.setSlotsToSetupPose();
                  }
                  
                  if (model.animation) {
                      if (skeletonData.findAnimation(model.animation)) {
                          model.animationState.setAnimation(0, model.animation, true);
                          model.playTime = 0;
                      }
                  }

                   if (this.#sequenceControllers && this.#sequenceControllers[model.name]) {
                       if (this.#recordingManager && this.#allSequencesStarted === 0) {
                           this.#recordingManager.startRecording();
                       }
                       this.#allSequencesStarted++;
                       this.#sequenceControllers[model.name].start();
                   }
              }
          }
        
         drawFrame(requestNextFrame = true) {
             if (this.config.statsActive) stats.begin();
             
             if (requestNextFrame && !this.stopRequestAnimationFrame)
                 requestAnimationFrame(() => this.drawFrame());
             
             var ctx = this.context;
             var gl = ctx.gl;
             var doc = document;
             var isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
             
             const bg = new spine.Color().setFromString(isFullscreen ? this.config.fullScreenBackgroundColor : this.config.backgroundColor);
             gl.clearColor(bg.r, bg.g, bg.b, bg.a);
             gl.clear(gl.COLOR_BUFFER_BIT);
             this.loadingScreen.backgroundColor.setFromColor(bg);
             this.loadingScreen.draw(this.assetManager.isLoadingComplete());
             
             if (this.assetManager.isLoadingComplete() && this.skeleton == null)
                 this.loadSkeleton();
             
             if (this.assetManager.isLoadingComplete() && this.#skeletonsToRender && !this.#skeletonsToRender[0].skeleton)
                 this.loadAllSkeletons();
             
             this.sceneRenderer.resize(spine.webgl.ResizeMode.Expand);
             
              if (this.loaded && this.#skeletonsToRender) {
                   if (!this.paused && this.config.animation) {
                       this.time.update();
                       var delta = this.time.delta * this.speed;
                       
                       for (let model of this.#skeletonsToRender) {
                           if (model.animationState && model.skeleton) {
                               model.animationState.update(delta);
                               model.animationState.apply(model.skeleton);
                           }
                           
                           if (this.#sequenceControllers && this.#sequenceControllers[model.name]) {
                               this.#sequenceControllers[model.name].checkAnimationProgress();
                           }
                       }
                       
                       this.timelineSlider.setValue(this.playTime / (this.animationState.getCurrent(0)?.animation?.duration || 1));
                   }
                 
                 for (let model of this.#skeletonsToRender) {
                     if (model.skeleton) {
                         model.skeleton.updateWorldTransform();
                     }
                 }
                 
                 var viewport = {
                     x: this.currentViewport.x - this.currentViewport.padLeft,
                     y: this.currentViewport.y - this.currentViewport.padBottom,
                     width: this.currentViewport.width + this.currentViewport.padLeft + this.currentViewport.padRight,
                     height: this.currentViewport.height + this.currentViewport.padBottom + this.currentViewport.padTop
                 };
                 
                 var transitionAlpha = ((performance.now() - this.viewportTransitionStart) / 1000) / this.config.viewport.transitionTime;
                 if (this.previousViewport && transitionAlpha < 1) {
                     var oldViewport = {
                         x: this.previousViewport.x - this.previousViewport.padLeft,
                         y: this.previousViewport.y - this.previousViewport.padBottom,
                         width: this.previousViewport.width + this.previousViewport.padLeft + this.previousViewport.padRight,
                         height: this.previousViewport.height + this.previousViewport.padBottom + this.previousViewport.padTop
                     };
                     viewport = {
                         x: oldViewport.x + (viewport.x - oldViewport.x) * transitionAlpha,
                         y: oldViewport.y + (viewport.y - oldViewport.y) * transitionAlpha,
                         width: oldViewport.width + (viewport.width - oldViewport.width) * transitionAlpha,
                         height: oldViewport.height + (viewport.height - oldViewport.height) * transitionAlpha
                     };
                 }
                 
                 var viewportSize = this.scale(viewport.width, viewport.height, this.canvas.width, this.canvas.height);
                 this.sceneRenderer.camera.zoom = viewport.width / viewportSize.x;
                 this.sceneRenderer.camera.position.x = viewport.x + viewport.width / 2;
                 this.sceneRenderer.camera.position.y = viewport.y + viewport.height / 2;
                 
                 this.sceneRenderer.begin();
                 
                 if (this.config.backgroundImage && this.config.backgroundImage.url) {
                     var bgImage = this.assetManager.get(this.config.backgroundImage.url);
                     if (!(this.config.backgroundImage.hasOwnProperty("x") && this.config.backgroundImage.hasOwnProperty("y") && this.config.backgroundImage.hasOwnProperty("width") && this.config.backgroundImage.hasOwnProperty("height"))) {
                         this.sceneRenderer.drawTexture(bgImage, viewport.x, viewport.y, viewport.width, viewport.height);
                     } else {
                         this.sceneRenderer.drawTexture(bgImage, this.config.backgroundImage.x, this.config.backgroundImage.y, this.config.backgroundImage.width, this.config.backgroundImage.height);
                     }
                 }
                 
                 for (let model of this.#skeletonsToRender) {
                     if (model.skeleton) {
                         this.sceneRenderer.drawSkeleton(model.skeleton, this.config.premultipliedAlpha);
                     }
                 }
                 
                 this.sceneRenderer.end();
                 this.sceneRenderer.camera.zoom = 0;
             }
             
             if (this.loaded) {
                 var animationDuration = 1;
                 if (this.animationState) animationDuration = this.animationState.getCurrent(0)?.animation?.duration || 1;
                 let pgn = Number((this.playTime / animationDuration).toFixed(1));
                 if (pgn !== this.#prevPgn) {
                     if (pgn == 0) this.onAnimeUpdate();
                     this.#prevPgn = pgn;
                 }
             }
             
             if (this.config.statsActive) stats.end();
         }
        
         onAnimeUpdate(isInit) {
             let as = this.animationState;
             let curani = as ? as.getCurrent(0)?.animation : null;
         }
         setAnimation(animation, loop = true) {
             console.log('[CustomSpineRender] setAnimation called with:', animation, 'loop:', loop);
             if (this.#skeletonsToRender) {
                 for (let model of this.#skeletonsToRender) {
                     if (model.animationState && model.skeleton) {
                         const skeletonData = model.skeleton.data;
                         const anim = skeletonData.findAnimation(animation);
                         if (anim) {
                             console.log('[CustomSpineRender] Setting animation for model:', model.name);
                             model.animationState.setAnimationWith(0, anim, loop);
                             model.playTime = 0;
                             
                             const controller = this.#sequenceControllers?.[model.name];
                             if (controller && controller.isActive()) {
                                 console.log('[CustomSpineRender] Stopping sequence for model:', model.name);
                                 controller.isPlayingSequence = false;
                             }
                         }
                     }
                 }
             }
             
             return super.setAnimation(animation, loop);
         }
        togglePMA() {
            let pma = this.config.premultipliedAlpha;
            if (!pma) { this.config.premultipliedAlpha = true; } else {
                this.config.premultipliedAlpha = false;
            };
        }
         get allAnimations() {
             return this.skeleton.data.animations.map(e => e.name);
         }
         setScale(scale = 1) {
             this.skeleton.scaleX = scale;
             this.skeleton.scaleY = scale;
         }
         onSequenceComplete(modelName) {
             console.log('[CustomSpineRender] Sequence completed for model:', modelName);
             this.#allSequencesCompleted++;
             
             if (this.#recordingManager && this.#allSequencesCompleted === this.#allSequencesStarted) {
                 console.log('[CustomSpineRender] All sequences completed, stopping recording and downloading');
                 this.#recordingManager.stopRecordingAndDownload(`animation_${Date.now()}.webm`);
             }
         }
     };

    let container;
    if (Array.isArray(containers) && containers[0].id) {
        container = isModel ? containers[0] : containers[Math.min(1, containers.length - 1)];
    } else {
        container = isModel ? containers[0] : containers[1];
    }
    
    const renderConfig = Object.assign(model, { 
        statsActive: isModel ? true : false, 
        container, 
        showControls: isModel ? true : false 
    });
    
    model.render = new CustomSpineRender(container.id, renderConfig);

    if (isModel && model.soundPlayer) await model.soundPlayer.bgmPlay().catch(e => { console.warn(e); });

    return model;
}
