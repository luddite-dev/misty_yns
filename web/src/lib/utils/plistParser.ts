import { XMLParser } from 'fast-xml-parser';

export interface SpriteFrame {
	spriteOffset: { x: number; y: number };
	spriteSize: { width: number; height: number };
	spriteSourceSize: { width: number; height: number };
	textureRect: { x: number; y: number; width: number; height: number };
	textureRotated: boolean;
}

export interface PlistFrames {
	[key: string]: SpriteFrame;
}

/**
 * Parses a coordinate string like "{0,0}" into an object
 */
function parseCoordinate(str: string): { x: number; y: number } {
	const match = str.match(/\{(\d+),(\d+)\}/);
	if (!match) return { x: 0, y: 0 };
	return { x: parseInt(match[1], 10), y: parseInt(match[2], 10) };
}

/**
 * Parses a size string like "{204,96}" into width and height
 */
function parseSize(str: string): { width: number; height: number } {
	const match = str.match(/\{(\d+),(\d+)\}/);
	if (!match) return { width: 0, height: 0 };
	return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
}

/**
 * Parses a texture rect string like "{{1,1},{204,96}}" into x, y, width, height
 */
function parseTextureRect(str: string): { x: number; y: number; width: number; height: number } {
	const match = str.match(/\{\{(\d+),(\d+)\},\{(\d+),(\d+)\}\}/);
	if (!match) return { x: 0, y: 0, width: 0, height: 0 };
	return {
		x: parseInt(match[1], 10),
		y: parseInt(match[2], 10),
		width: parseInt(match[3], 10),
		height: parseInt(match[4], 10)
	};
}

/**
 * Parses a plist XML string and extracts frame metadata
 */
export async function parsePlist(plistContent: string): Promise<PlistFrames> {
	const parser = new XMLParser();
	const parsed = parser.parse(plistContent);

	// Navigate to the frames dictionary in the plist structure
	const plist = parsed.plist;
	if (!plist || !plist.dict) {
		throw new Error('Invalid plist format: no plist.dict found');
	}

	const rootDict = plist.dict;
	if (!rootDict.key) {
		throw new Error('Invalid plist format: no keys found');
	}

	// Find the 'frames' key and get its corresponding dict
	const keyArray = Array.isArray(rootDict.key) ? rootDict.key : [rootDict.key];
	const dictArray = Array.isArray(rootDict.dict) ? rootDict.dict : [rootDict.dict];

	let framesIndex = -1;
	for (let i = 0; i < keyArray.length; i++) {
		if (keyArray[i] === 'frames') {
			framesIndex = i;
			break;
		}
	}

	if (framesIndex === -1) {
		throw new Error('Invalid plist format: no frames key found');
	}

	const framesDict = dictArray[framesIndex];
	if (!framesDict) {
		throw new Error('Invalid plist format: frames dict not found');
	}

	// Parse all frames
	const frames: PlistFrames = {};
	const frameKeyArray = Array.isArray(framesDict.key) ? framesDict.key : [framesDict.key];
	const frameValueArray = Array.isArray(framesDict.dict) ? framesDict.dict : [framesDict.dict];

	for (let i = 0; i < frameKeyArray.length; i++) {
		const frameName = frameKeyArray[i];
		const frameDict = frameValueArray[i];

		if (!frameDict) continue;

		// Extract values from the frame dict
		const frameKeyArray2 = Array.isArray(frameDict.key) ? frameDict.key : [frameDict.key];
		const stringArray = Array.isArray(frameDict.string) ? frameDict.string : frameDict.string ? [frameDict.string] : [];

		// Build a map of key names to their values in order
		let stringIndex = 0;
		const valueMap: { [key: string]: string } = {};

		for (let keyIdx = 0; keyIdx < frameKeyArray2.length; keyIdx++) {
			const keyName = frameKeyArray2[keyIdx];
			
			// Skip non-string values (arrays, booleans)
			if (keyName === 'aliases') {
				// Skip array
				continue;
			} else if (keyName === 'textureRotated') {
				// Handle boolean
				continue;
			} else if (stringIndex < stringArray.length) {
				// It's a string value
				valueMap[keyName] = stringArray[stringIndex];
				stringIndex++;
			}
		}

		// Get textureRotated boolean value
		let textureRotated = false;
		if (frameDict.false !== undefined && frameDict.false !== '') {
			textureRotated = false;
		} else if (frameDict.true !== undefined && frameDict.true !== '') {
			textureRotated = true;
		}

		frames[frameName] = {
			spriteOffset: parseCoordinate(valueMap['spriteOffset'] || '{0,0}'),
			spriteSize: parseSize(valueMap['spriteSize'] || '{0,0}'),
			spriteSourceSize: parseSize(valueMap['spriteSourceSize'] || '{0,0}'),
			textureRect: parseTextureRect(valueMap['textureRect'] || '{{0,0},{0,0}}'),
			textureRotated
		};
	}

	return frames;
}

/**
 * Fetches and parses a plist file from the given URL
 */
export async function fetchAndParsePlist(url: string): Promise<PlistFrames> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch plist: ${response.statusText}`);
	}
	const content = await response.text();
	return parsePlist(content);
}
