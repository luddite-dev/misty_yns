import type { TopLevel as Character } from '../types/characters';
import type { TopLevel as Scene } from '../types/scenes';
import { dataStore } from '../stores/dataStore';
import { fetchAndParsePlist, type PlistFrames } from '../utils/plistParser';
import { extractSpriteFromAtlas } from '../utils/spriteExtractor';
import {
	getScenePreview,
	storeScenePreview,
	getScenePreviewBatch,
	storeScenePreviewBatch
} from '../utils/indexedDB';

const SCENES_DATA_URL =
	'https://assets4.mist-train-girls.com/production-client-web-static/MasterData/MSceneViewModel.json';
const EX_SCENARIO_BASE_URL =
	'https://assets4.mist-train-girls.com/production-client-web-assets/Textures/Icons/Atlas/CharacterExScenario';

export interface CharacterScene {
	id: number;
	title: string;
	kizunaRank: number;
	isAdult: boolean;
	previewUrl?: string;
}

let cachedScenes: Scene[] | null = null;

async function fetchScenesFromAPI(): Promise<Scene[]> {
	try {
		const response = await fetch(SCENES_DATA_URL);
		if (!response.ok) {
			throw new Error(`Failed to fetch scenes: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Error fetching scenes:', error);
		throw error;
	}
}

async function getCachedScenes(): Promise<Scene[] | null> {
	if (cachedScenes) {
		return cachedScenes;
	}

	try {
		// Use store subscription to get cached scenes
		return new Promise((resolve) => {
			let unsubscribe: (() => void) | null = null;
			unsubscribe = dataStore.subscribe((data) => {
				if (unsubscribe) {
					unsubscribe();
				}
				resolve(data.scenes);
			});
		});
	} catch {
		return null;
	}
}

/**
 * Fetches all scenes and chains them together using NextMSceneId.
 * Automatically checks cache before fetching from API.
 * Populates cache if fetched from API.
 */
export async function fetchScenes(): Promise<Scene[]> {
	// Check in-memory cache first
	if (cachedScenes) {
		return cachedScenes;
	}

	// Check store cache
	const cached = await getCachedScenes();
	if (cached && cached.length > 0) {
		cachedScenes = cached;
		return cached;
	}

	// Fetch from API if not cached
	const scenes = await fetchScenesFromAPI();
	cachedScenes = scenes;
	await dataStore.setScenes(scenes);

	return scenes;
}

/**
 * Gets all scenes for a character by following the scene chain
 * Starts from character's MCharacterScenes and follows NextMSceneId
 * For continuation scenes (Title = "その後――"), reuses the previous scene's title
 */
export function getCharacterScenes(
	character: Character,
	allScenes: Scene[]
): CharacterScene[] {
	const sceneMap = new Map(allScenes.map((scene) => [scene.Id, scene]));
	const result: CharacterScene[] = [];
	const CONTINUATION_MARKER = 'その後――';

	// Get all the scene IDs from character's MCharacterScenes
	for (const characterScene of character.MCharacterScenes) {
		const sceneId = characterScene.MSceneId;
		const visited = new Set<number>();
		let currentSceneId: number | null = sceneId;
		let previousTitle = '';

		// Follow the chain of NextMSceneId
		while (currentSceneId !== null && currentSceneId !== undefined) {
			// Prevent infinite loops
			if (visited.has(currentSceneId)) {
				break;
			}
			visited.add(currentSceneId);

			const scene = sceneMap.get(currentSceneId);
			if (!scene) {
				break;
			}

			// Use previous title for continuation scenes
			const displayTitle = scene.Title === CONTINUATION_MARKER ? previousTitle : scene.Title;
			previousTitle = displayTitle;

			result.push({
				id: scene.Id,
				title: displayTitle,
				kizunaRank: characterScene.KizunaRank,
				isAdult: scene.IsAdult
			});

			currentSceneId = scene.NextMSceneId;
		}
	}

	return result;
}

/**
 * Ex scene preview cache: {sceneId: dataUrl}
 */
const exScenePreviewCache = new Map<number, string>();

/**
 * Finds which atlas index contains a scene by trying each one
 * Returns the atlas index, or -1 if not found
 */
async function findExSceneAtlasIndex(sceneId: number, maxAtlas: number = 9): Promise<number> {
	for (let i = 1; i < maxAtlas; i++) {
		try {
			const plistUrl = `${EX_SCENARIO_BASE_URL}/characterExScenario-${i}.plist`;
			const frames = await fetchAndParsePlist(plistUrl);

			// Look for the scene in this atlas
			const frameKey = `${sceneId}.png`;
			if (frameKey in frames) {
				return i;
			}
		} catch (error) {
			// This atlas doesn't exist or can't be parsed, try next one
			continue;
		}
	}

	return -1;
}

/**
 * Fetches the preview image for an Ex scene by:
 * 1. Finding which atlas contains the scene
 * 2. Parsing the plist metadata
 * 3. Extracting the sprite from the PNG
 */
export async function fetchExScenePreview(sceneId: number): Promise<string | null> {
	// Check cache first
	if (exScenePreviewCache.has(sceneId)) {
		return exScenePreviewCache.get(sceneId) || null;
	}

	try {
		// Find which atlas contains this scene
		const atlasIndex = await findExSceneAtlasIndex(sceneId);
		if (atlasIndex === -1) {
			console.warn(`Scene ${sceneId} not found in any Ex scenario atlas`);
			return null;
		}

		// Fetch and parse the plist
		const plistUrl = `${EX_SCENARIO_BASE_URL}/characterExScenario-${atlasIndex}.plist`;
		const frames = await fetchAndParsePlist(plistUrl);

		// Get the frame for this scene
		const frameKey = `${sceneId}.png`;
		if (!(frameKey in frames)) {
			console.warn(`Frame ${frameKey} not found in plist`);
			return null;
		}

		// Extract the sprite from the PNG
		const pngUrl = `${EX_SCENARIO_BASE_URL}/characterExScenario-${atlasIndex}.png`;
		const previewUrl = await extractSpriteFromAtlas(pngUrl, frames[frameKey]);

		// Cache it
		exScenePreviewCache.set(sceneId, previewUrl);
		return previewUrl;
	} catch (error) {
		console.error(`Failed to fetch Ex scene preview for scene ${sceneId}:`, error);
		return null;
	}
}

/**
 * Fetches preview URLs for multiple Ex scenes
 */
export async function fetchExScenePreviewBatch(sceneIds: number[]): Promise<{
	[key: number]: string | null;
}> {
	const results: { [key: number]: string | null } = {};

	for (const sceneId of sceneIds) {
		results[sceneId] = await fetchExScenePreview(sceneId);
	}

	return results;
}

export interface ExSceneInfo {
	frameId: string;
	sceneId: string;
	previewUrl: string | null;
}

/**
 * Fetches all Ex scene atlas data (plists and PNGs) and extracts all scene information
 * This is optimized to fetch each atlas once and extract all sprites from it
 */
export async function fetchAllExScenes(
	maxAtlasIndex: number = 9,
	onProgress?: (current: number, total: number) => void
): Promise<ExSceneInfo[]> {
	const allScenes: ExSceneInfo[] = [];
	const seenFrameIds = new Set<string>();
	let processedAtlases = 0;

	// Try to fetch all atlases up to maxAtlasIndex
	for (let i = 1; i <= maxAtlasIndex; i++) {
		try {
			const plistUrl = `${EX_SCENARIO_BASE_URL}/characterExScenario-${i}.plist`;
			const pngUrl = `${EX_SCENARIO_BASE_URL}/characterExScenario-${i}.png`;

			// Fetch plist and PNG in parallel
			const [frames, pngResponse] = await Promise.all([
				fetchAndParsePlist(plistUrl),
				fetch(pngUrl)
			]);

			if (!pngResponse.ok) {
				console.warn(`Failed to fetch PNG for atlas ${i}`);
				continue;
			}

			// Convert PNG to bitmap once for all sprites in this atlas
			const blob = await pngResponse.blob();
			const bitmap = await createImageBitmap(blob);

			// Process all frames in this atlas
			const frameKeys = Object.keys(frames);

			// Check IndexedDB for cached previews
			const sceneIds = frameKeys.map((key) => key.replace('.png', ''));
			const cachedPreviews = await getScenePreviewBatch(sceneIds);

			const newPreviews: Array<{ sceneId: string; previewDataUrl: string }> = [];

			for (const frameKey of frameKeys) {
				// Extract scene ID from frame key (remove .png extension)
				const frameId = frameKey.replace('.png', '');
				
				// Skip duplicates
				if (seenFrameIds.has(frameId)) {
					continue;
				}
				seenFrameIds.add(frameId);
				
				// EVENT_ID = FRAME_ID[1:-2] according to readme
				const sceneId = frameId.slice(1, -2);

				// Check if we have a cached preview
				let previewUrl = cachedPreviews.get(frameId);

				if (!previewUrl) {
					// Extract sprite from atlas
					try {
						previewUrl = await extractSpriteFromAtlasWithBitmap(bitmap, frames[frameKey]);
						// Store in batch array for later IndexedDB write
						newPreviews.push({ sceneId: frameId, previewDataUrl: previewUrl });
					} catch (error) {
						console.error(`Failed to extract sprite for ${frameKey}:`, error);
						previewUrl = null;
					}
				}

				allScenes.push({
					frameId,
					sceneId,
					previewUrl
				});
			}

			// Store all new previews in IndexedDB in one batch
			if (newPreviews.length > 0) {
				await storeScenePreviewBatch(newPreviews);
			}

			processedAtlases++;
			if (onProgress) {
				onProgress(processedAtlases, maxAtlasIndex);
			}
		} catch (error) {
			// Atlas doesn't exist or failed to parse, skip it
			console.warn(`Failed to process atlas ${i}:`, error);
			processedAtlases++;
			if (onProgress) {
				onProgress(processedAtlases, maxAtlasIndex);
			}
			continue;
		}
	}

	return allScenes;
}

/**
 * Helper function to extract sprite from an already-loaded bitmap
 * This is more efficient than extractSpriteFromAtlas when processing multiple sprites from the same atlas
 */
async function extractSpriteFromAtlasWithBitmap(
	bitmap: ImageBitmap,
	frame: any
): Promise<string> {
	const { textureRect, textureRotated, spriteOffset, spriteSize } = frame;

	// When rotated, the canvas dimensions are swapped
	const canvasWidth = spriteSize.width;
	const canvasHeight = spriteSize.height;

	// Create a canvas for the extracted sprite
	const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Failed to get canvas context');
	}

	// Save canvas state
	ctx.save();

	// Apply rotation if needed
	if (textureRotated) {
		// Save original dimensions
		const originalWidth = textureRect.width;
		const originalHeight = textureRect.height;

		// Swap dimensions for the source rectangle
		textureRect.width = originalHeight;
		textureRect.height = originalWidth;

		// Rotate canvas to capture the rotated sprite correctly
		ctx.translate(canvasWidth, 0);
		ctx.rotate((Math.PI / 180) * 90);
	}

	// Draw the sprite from the atlas
	ctx.drawImage(
		bitmap,
		textureRect.x, // source x in atlas
		textureRect.y, // source y in atlas
		textureRect.width, // source width (swapped if rotated)
		textureRect.height, // source height (swapped if rotated)
		spriteOffset.x, // destination x
		spriteOffset.y, // destination y
		textureRect.width, // destination width
		textureRect.height // destination height
	);

	// Restore canvas state
	ctx.restore();

	// Convert canvas to blob and then to data URL
	const spriteBlob = await canvas.convertToBlob();
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(spriteBlob);
	});
}
