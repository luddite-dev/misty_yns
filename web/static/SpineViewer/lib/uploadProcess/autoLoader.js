import { parseConfig } from '../configParser.js';

async function fetchFileAsBlob(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            return null;
        }
        return await response.blob();
    } catch (error) {
        return null;
    }
}

export default async function autoLoader() {
    const params = new URLSearchParams(window.location.search);
    const basePath = params.get('assetPath') || './public/demo4/';
    if (!basePath.endsWith('/')) {
        basePath += '/';
    }
    const configPath = `${basePath}config.ini`;
    const config = await parseConfig(configPath);
    
    if (!config || !config.sprites || Object.keys(config.sprites).length === 0) {
        return null;
    }

    const sprites = config.sprites;
    const animations = config.animations || {};
    const allFiles = [];
    const modelsData = {};

    const defaultAnimation = animations.default;

    for (const [spriteName, fileRefs] of Object.entries(sprites)) {
        for (const [fileType, fileName] of Object.entries(fileRefs)) {
            const path = basePath + fileName;
            const blob = await fetchFileAsBlob(path);
            if (blob) {
                const file = new File([blob], fileName, { type: blob.type });
                allFiles.push(file);
            }
        }
        
        if (animations[spriteName]) {
            modelsData[spriteName] = animations[spriteName];
        } else if (defaultAnimation) {
            modelsData[spriteName] = defaultAnimation;
        }
    }

    if (allFiles.length === 0) {
        return null;
    }

    return { files: allFiles, animationSequences: modelsData, hasAnimationConfig: defaultAnimation ? true : false };
}
