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

/**
 * Determines if a number is even
 */
function isEven(num) {
    return num % 2 === 0;
}

/**
 * Get MIME type for a file extension
 */
function getMimeType(ext) {
    const mimeTypes = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'atlas': 'text/plain',
        'skel': 'application/octet-stream',
        'json': 'application/json',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Attempts to fetch all files for a given index with optional suffix variation
 */
async function fetchAllFilesForIndex(baseUrl, index) {
    const indexStr = isEven(index) ? `${index}m` : `${index}`;
    const extensions = ['skel', 'atlas', 'png'];
    const files = [];
    let foundAny = false;
    
    // Try with current suffix
    for (const ext of extensions) {
        const url = `${baseUrl}/${indexStr}.${ext}`;
        const blob = await fetchFileAsBlob(url);
        if (blob) {
            const fileName = `${indexStr}.${ext}`;
            // Ensure proper MIME type is set
            const mimeType = getMimeType(ext);
            const typedBlob = blob.type ? blob : new Blob([blob], { type: mimeType });
            const file = new File([typedBlob], fileName, { type: mimeType });
            files.push(file);
            foundAny = true;
        }
    }
    
    if (foundAny) {
        return { files, indexStr };
    }
    
    // Try with alternate suffix (add/remove 'm')
    const altIndexStr = indexStr.endsWith('m') ? indexStr.slice(0, -1) : `${indexStr}m`;
    for (const ext of extensions) {
        const url = `${baseUrl}/${altIndexStr}.${ext}`;
        const blob = await fetchFileAsBlob(url);
        if (blob) {
            const fileName = `${altIndexStr}.${ext}`;
            // Ensure proper MIME type is set
            const mimeType = getMimeType(ext);
            const typedBlob = blob.type ? blob : new Blob([blob], { type: mimeType });
            const file = new File([typedBlob], fileName, { type: mimeType });
            files.push(file);
            foundAny = true;
        }
    }
    
    if (foundAny) {
        return { files, indexStr: altIndexStr };
    }
    
    return null;
}

export default async function autoLoader() {
    const params = new URLSearchParams(window.location.search);
    const frameId = params.get('frameId');
    
    if (!frameId) {
        console.error('frameId parameter is required');
        return null;
    }
    
    // Extract path from frame ID (frameId[1:3] inclusive)
    const framePath = frameId.substring(1, 4);
    const baseUrl = `https://assets4.mist-train-girls.com/production-client-web-assets/Spines/Stills/${framePath}/${frameId}`;
    
    const allFiles = [];
    const modelsData = {};
    const loadedIndices = new Set();
    
    // Fetch all available Spine assets
    let index = 1;
    while (true) {
        const result = await fetchAllFilesForIndex(baseUrl, index);
        if (!result) {
            console.log(`No files found for index ${index}. Stopping asset fetch.`);
            break;
        }
        
        const { files, indexStr } = result;
        console.log(`[autoLoader] Fetched ${files.length} files for index ${index} (${indexStr}):`, files.map(f => f.name));
        files.forEach(file => allFiles.push(file));
        loadedIndices.add(indexStr);
        
        index++;
    }
    
    if (allFiles.length === 0) {
        console.error('No Spine assets found for frameId:', frameId);
        return null;
    }
    
    // Create default animation data for loaded models
    for (const indexStr of loadedIndices) {
        modelsData[indexStr] = [];
    }
    
    console.log('[autoLoader] Total files loaded:', allFiles.length, 'Models:', loadedIndices);
    return { files: allFiles, animationSequences: modelsData, hasAnimationConfig: false };
}
