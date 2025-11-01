import { writable, derived } from 'svelte/store';
import type { TopLevel as Character } from '../types/characters';
import type { TopLevel as Scene } from '../types/scenes';

const DB_NAME = 'mtg_cache';
const DB_VERSION = 1;
const CHARACTERS_STORE = 'characters';
const SCENES_STORE = 'scenes';
const METADATA_STORE = 'metadata';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

interface CacheMetadata {
	key: string;
	timestamp: number;
}

interface CacheData {
	characters: Character[] | null;
	scenes: Scene[] | null;
}

let dbInstance: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
	if (dbInstance) {
		return dbInstance;
	}

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			dbInstance = request.result;
			resolve(dbInstance);
		};

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(CHARACTERS_STORE)) {
				db.createObjectStore(CHARACTERS_STORE, { keyPath: 'key' });
			}
			if (!db.objectStoreNames.contains(SCENES_STORE)) {
				db.createObjectStore(SCENES_STORE, { keyPath: 'key' });
			}
			if (!db.objectStoreNames.contains(METADATA_STORE)) {
				db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
			}
		};
	});
}

async function getFromDB(storeName: string, key: string): Promise<any | null> {
	try {
		const db = await getDB();
		const transaction = db.transaction(storeName, 'readonly');
		const store = transaction.objectStore(storeName);

		return new Promise((resolve, reject) => {
			const request = store.get(key);
			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result || null);
		});
	} catch (error) {
		console.error(`Failed to get from ${storeName}:`, error);
		return null;
	}
}

async function saveToDBStore(
	storeName: string,
	key: string,
	data: any,
	metadataKey: string
): Promise<void> {
	try {
		const db = await getDB();

		// Save data
		const dataTransaction = db.transaction(storeName, 'readwrite');
		const dataStore = dataTransaction.objectStore(storeName);
		dataStore.put({ key, data });

		// Save metadata
		const metaTransaction = db.transaction(METADATA_STORE, 'readwrite');
		const metaStore = metaTransaction.objectStore(METADATA_STORE);
		metaStore.put({ key: metadataKey, timestamp: Date.now() });
	} catch (error) {
		console.error(`Failed to save to ${storeName}:`, error);
	}
}

async function isCacheValid(metadataKey: string): Promise<boolean> {
	try {
		const metadata = await getFromDB(METADATA_STORE, metadataKey);
		if (!metadata) return false;

		const age = Date.now() - metadata.timestamp;
		return age < CACHE_DURATION;
	} catch (error) {
		console.error('Failed to check cache validity:', error);
		return false;
	}
}

async function clearAllCache(): Promise<void> {
	try {
		const db = await getDB();

		for (const storeName of [CHARACTERS_STORE, SCENES_STORE, METADATA_STORE]) {
			const transaction = db.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			store.clear();
		}
	} catch (error) {
		console.error('Failed to clear cache:', error);
	}
}

function createCachedStore() {
	// Create store without any initialization logic
	const { subscribe, set, update } = writable<CacheData>({ characters: null, scenes: null });

	return {
		subscribe,
		setCharacters: async (characters: Character[]) => {
			update((store) => ({ ...store, characters }));
			await saveToDBStore(CHARACTERS_STORE, 'characters', characters, 'characters_metadata');
		},
		setScenes: async (scenes: Scene[]) => {
			update((store) => ({ ...store, scenes }));
			await saveToDBStore(SCENES_STORE, 'scenes', scenes, 'scenes_metadata');
		},
		clear: async () => {
			await clearAllCache();
			set({ characters: null, scenes: null });
		}
	};
}

export const dataStore = createCachedStore();

// Derived store for checking if data is loading
export const isLoading = derived(dataStore, ($store) => {
	return $store.characters === null || $store.scenes === null;
});

