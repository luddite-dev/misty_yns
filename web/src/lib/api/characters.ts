import type { TopLevel } from '../types/characters';

const CHARACTER_DATA_URL =
	'https://assets4.mist-train-girls.com/production-client-web-static/MasterData/MCharacterViewModel.json';

export interface Character {
	id: number;
	name: string;
	profileImageUrl: string;
}

export async function fetchCharacters(): Promise<Character[]> {
	try {
		const response = await fetch(CHARACTER_DATA_URL);
		if (!response.ok) {
			throw new Error(`Failed to fetch characters: ${response.statusText}`);
		}

		const data: TopLevel[] = await response.json();

		return data.map((char) => ({
			id: char.Id,
			name: char.MCharacterBase.Name || char.Name,
			profileImageUrl: `https://assets4.mist-train-girls.com/production-client-web-assets/Textures/Characters/ScenarioPhrase/${char.Id}.png`
		}));
	} catch (error) {
		console.error('Error fetching characters:', error);
		throw error;
	}
}
