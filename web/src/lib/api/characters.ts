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

/**
 * Fetches simplified character data (id, name, profile image).
 * Uses cache if available, otherwise fetches from API and populates cache.
 */
export async function fetchCharacters(): Promise<Character[]> {
	let fullData = cachedFullData;

	if (!fullData) {
		fullData = await fetchCharactersFromAPI();
		cachedFullData = fullData;
		await dataStore.setCharacters(fullData);
	}

	return fullData.map((char) => ({
		id: char.Id,
		name: char.MCharacterBase.Name || char.Name,
		profileImageUrl: `https://assets4.mist-train-girls.com/production-client-web-assets/Textures/Characters/ScenarioPhrase/${char.Id}.png`
	}));
}

/**
 * Fetches full character data with all fields.
 * Uses cache if available, otherwise fetches from API and populates cache.
 */
export async function fetchCharactersFullData(): Promise<TopLevel[]> {
	if (cachedFullData) {
		return cachedFullData;
	}

	const fullData = await fetchCharactersFromAPI();
	cachedFullData = fullData;
	await dataStore.setCharacters(fullData);

	return fullData;
}

