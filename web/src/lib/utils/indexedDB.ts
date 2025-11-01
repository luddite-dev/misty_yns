const DB_NAME = 'yns_train_db';
const DB_VERSION = 1;
const SCENE_PREVIEWS_STORE = 'scene_previews';

interface ScenePreview {
	sceneId: string;
	previewDataUrl: string;
	timestamp: number;
}

/**
 * Opens the IndexedDB database and creates stores if needed
 */
async function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			// Create scene previews store if it doesn't exist
			if (!db.objectStoreNames.contains(SCENE_PREVIEWS_STORE)) {
				const store = db.createObjectStore(SCENE_PREVIEWS_STORE, { keyPath: 'sceneId' });
				store.createIndex('timestamp', 'timestamp', { unique: false });
			}
		};
	});
}

/**
 * Stores a scene preview in IndexedDB
 */
export async function storeScenePreview(sceneId: string, previewDataUrl: string): Promise<void> {
	const db = await openDB();
	const transaction = db.transaction([SCENE_PREVIEWS_STORE], 'readwrite');
	const store = transaction.objectStore(SCENE_PREVIEWS_STORE);

	const preview: ScenePreview = {
		sceneId,
		previewDataUrl,
		timestamp: Date.now()
	};

	return new Promise((resolve, reject) => {
		const request = store.put(preview);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

/**
 * Retrieves a scene preview from IndexedDB
 */
export async function getScenePreview(sceneId: string): Promise<string | null> {
	const db = await openDB();
	const transaction = db.transaction([SCENE_PREVIEWS_STORE], 'readonly');
	const store = transaction.objectStore(SCENE_PREVIEWS_STORE);

	return new Promise((resolve, reject) => {
		const request = store.get(sceneId);
		request.onsuccess = () => {
			const result = request.result as ScenePreview | undefined;
			resolve(result?.previewDataUrl || null);
		};
		request.onerror = () => reject(request.error);
	});
}

/**
 * Stores multiple scene previews in a batch
 */
export async function storeScenePreviewBatch(
	previews: Array<{ sceneId: string; previewDataUrl: string }>
): Promise<void> {
	const db = await openDB();
	const transaction = db.transaction([SCENE_PREVIEWS_STORE], 'readwrite');
	const store = transaction.objectStore(SCENE_PREVIEWS_STORE);

	const timestamp = Date.now();

	for (const { sceneId, previewDataUrl } of previews) {
		const preview: ScenePreview = {
			sceneId,
			previewDataUrl,
			timestamp
		};
		store.put(preview);
	}

	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
	});
}

/**
 * Retrieves multiple scene previews in a batch
 * Returns a map of sceneId -> previewDataUrl
 */
export async function getScenePreviewBatch(
	sceneIds: string[]
): Promise<Map<string, string>> {
	const db = await openDB();
	const transaction = db.transaction([SCENE_PREVIEWS_STORE], 'readonly');
	const store = transaction.objectStore(SCENE_PREVIEWS_STORE);

	const results = new Map<string, string>();

	return new Promise((resolve, reject) => {
		let pending = sceneIds.length;

		if (pending === 0) {
			resolve(results);
			return;
		}

		for (const sceneId of sceneIds) {
			const request = store.get(sceneId);
			request.onsuccess = () => {
				const result = request.result as ScenePreview | undefined;
				if (result?.previewDataUrl) {
					results.set(sceneId, result.previewDataUrl);
				}
				pending--;
				if (pending === 0) {
					resolve(results);
				}
			};
			request.onerror = () => {
				pending--;
				if (pending === 0) {
					resolve(results);
				}
			};
		}
	});
}

/**
 * Clears all scene previews from IndexedDB
 */
export async function clearScenePreviews(): Promise<void> {
	const db = await openDB();
	const transaction = db.transaction([SCENE_PREVIEWS_STORE], 'readwrite');
	const store = transaction.objectStore(SCENE_PREVIEWS_STORE);

	return new Promise((resolve, reject) => {
		const request = store.clear();
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

/**
 * Gets all stored scene preview IDs
 */
export async function getAllScenePreviewIds(): Promise<string[]> {
	const db = await openDB();
	const transaction = db.transaction([SCENE_PREVIEWS_STORE], 'readonly');
	const store = transaction.objectStore(SCENE_PREVIEWS_STORE);

	return new Promise((resolve, reject) => {
		const request = store.getAllKeys();
		request.onsuccess = () => resolve(request.result as string[]);
		request.onerror = () => reject(request.error);
	});
}

/**
 * Gets all stored scene previews
 */
export async function getAllScenePreviews(): Promise<Array<{ sceneId: string; previewDataUrl: string }>> {
	const db = await openDB();
	const transaction = db.transaction([SCENE_PREVIEWS_STORE], 'readonly');
	const store = transaction.objectStore(SCENE_PREVIEWS_STORE);

	return new Promise((resolve, reject) => {
		const request = store.getAll();
		request.onsuccess = () => {
			const results = request.result as ScenePreview[];
			resolve(results.map(r => ({ sceneId: r.sceneId, previewDataUrl: r.previewDataUrl })));
		};
		request.onerror = () => reject(request.error);
	});
}
