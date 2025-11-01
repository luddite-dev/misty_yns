import type { TopLevel } from '../types/characters';
import { dataStore } from '../stores/dataStore';

const CHARACTER_DATA_URL =
	'https://assets4.mist-train-girls.com/production-client-web-static/MasterData/MCharacterViewModel.json';

export interface Character {
	id: number;
	name: string;
	profileImageUrl: string;
}

let cachedFullData: TopLevel[] | null = null;

async function fetchCharactersFromAPI(): Promise<TopLevel[]> {
	try {
		const response = await fetch(CHARACTER_DATA_URL);
		if (!response.ok) {
			throw new Error(`Failed to fetch characters: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching characters:', error);
		throw error;
	}
}

async function getCachedCharactersFullData(): Promise<TopLevel[] | null> {
	if (cachedFullData) {
		return cachedFullData;
	}

	try {
		// Use a promise that resolves with the first subscriber value
		return new Promise((resolve) => {
			let unsubscribe: (() => void) | null = null;
			unsubscribe = dataStore.subscribe((data) => {
				if (unsubscribe) {
					unsubscribe();
				}
				resolve(data.characters);
			});
		});
	} catch {
		return null;
	}
}

/**
 * Fetches simplified character data (id, name, profile image).
 * Uses cache if available, otherwise fetches from API and populates cache.
 */
export async function fetchCharacters(): Promise<Character[]> {
	const fullData = await fetchCharactersFullData();
	return fullData.map((char) => ({
		id: char.Id,
		name: char.MCharacterBase.Name || char.Name,
		profileImageUrl: `https://assets4.mist-train-girls.com/production-client-web-assets/Textures/Characters/ScenarioPhrase/${char.Id}.png`
	}));
}

/**
 * Fetches full character data with all fields.
 * Automatically checks cache (in-memory, then store) before fetching from API.
 * Populates cache if fetched from API.
 */
export async function fetchCharactersFullData(): Promise<TopLevel[]> {
	// Check in-memory cache first
	if (cachedFullData) {
		return cachedFullData;
	}

	// Check store cache
	const cached = await getCachedCharactersFullData();
	if (cached && cached.length > 0) {
		cachedFullData = cached;
		return cached;
	}

	// Fetch from API if not cached
	const fullData = await fetchCharactersFromAPI();
	cachedFullData = fullData;
	await dataStore.setCharacters(fullData);

	return fullData;
}

