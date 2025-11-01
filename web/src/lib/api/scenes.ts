import type { TopLevel as Character } from '../types/characters';
import type { TopLevel as Scene } from '../types/scenes';
import { dataStore } from '../stores/dataStore';
import { fetchAndParsePlist } from '../utils/plistParser';
import { extractSpriteFromAtlas } from '../utils/spriteExtractor';

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
 */
export function getCharacterScenes(
	character: Character,
	allScenes: Scene[]
): CharacterScene[] {
	const sceneMap = new Map(allScenes.map((scene) => [scene.Id, scene]));
	const result: CharacterScene[] = [];

	// Get all the scene IDs from character's MCharacterScenes
	for (const characterScene of character.MCharacterScenes) {
		const sceneId = characterScene.MSceneId;
		const visited = new Set<number>();
		let currentSceneId: number | null = sceneId;

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

			result.push({
				id: scene.Id,
				title: scene.Title,
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
async function findExSceneAtlasIndex(sceneId: number, maxAtlas: number = 10): Promise<number> {
	for (let i = 0; i < maxAtlas; i++) {
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
