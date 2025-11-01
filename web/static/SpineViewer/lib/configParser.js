async function fetchText(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            return null;
        }
        return await response.text();
    } catch (error) {
        return null;
    }
}

export async function parseConfig(configPath) {
    const configText = await fetchText(configPath);
    if (!configText) {
        return null;
    }

    const sprites = {};
    const animations = {};
    const lines = configText.split(/\r\n|\r|\n/);
    let currentSection = null;

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith(';')) {
            continue;
        }

        const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1];
            continue;
        }

        if (currentSection === 'sprites') {
            const paramMatch = trimmed.match(/^([^=]+)=(.+)$/);
            if (paramMatch) {
                const spriteName = paramMatch[1].trim();
                const filesList = paramMatch[2].split(',').map(f => f.trim());
                
                if (filesList.length >= 3) {
                    sprites[spriteName] = {
                        atlas: filesList[0],
                        skel: filesList[1],
                        png: filesList[2]
                    };
                }
            }
        }

        if (currentSection === 'animations') {
             const paramMatch = trimmed.match(/^([^=]+)=(.+)$/);
             if (paramMatch) {
                 const spriteName = paramMatch[1].trim();
                 const sequenceStr = paramMatch[2];
                 const sequenceArray = sequenceStr.split(',').map(item => {
                     const [animName, timeStr] = item.trim().split(':');
                     return {
                         name: animName.trim(),
                         duration: parseFloat(timeStr.trim()) || 1
                     };
                 });
                 
                 if (sequenceArray.length > 0) {
                     animations[spriteName] = sequenceArray;
                 }
             }
         }
    }

    return { sprites, animations };
}
