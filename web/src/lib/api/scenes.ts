import type { TopLevel as Character } from '../types/characters';
import type { TopLevel as Scene } from '../types/scenes';
import { dataStore } from '../stores/dataStore';

const SCENES_DATA_URL =
	'https://assets4.mist-train-girls.com/production-client-web-static/MasterData/MSceneViewModel.json';

export interface CharacterScene {
	id: number;
	title: string;
	kizunaRank: number;
	isAdult: boolean;
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
