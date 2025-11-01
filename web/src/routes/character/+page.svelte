<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchCharactersFullData } from '$lib/api/characters';
	import { fetchScenes, getCharacterScenes, fetchExScenePreview } from '$lib/api/scenes';
	import type { TopLevel as Character } from '$lib/types/characters';
	import type { CharacterScene } from '$lib/api/scenes';

	let character: Character | null = $state(null);
	let characterScenes: CharacterScene[] = $state([]);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);
	let loadingPreviews: boolean = $state(false);

	onMount(async () => {
		try {
			loading = true;
			const params = new URLSearchParams(window.location.search);
			const characterId = parseInt(params.get('id') || '');

			if (!characterId || isNaN(characterId)) {
				error = 'Invalid character ID';
				loading = false;
				return;
			}

			// Fetch all data (automatically uses cache if available)
			const [characters, scenes] = await Promise.all([fetchCharactersFullData(), fetchScenes()]);

			// Find the character
			character = characters.find((c) => c.Id === characterId) || null;

			if (!character) {
				error = 'Character not found';
				loading = false;
				return;
			}

			// Get scenes for this character
			characterScenes = getCharacterScenes(character, scenes);

			// Load Ex scene previews in the background
			loadPreviewsInBackground();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load character';
		} finally {
			loading = false;
		}
	});

	async function loadPreviewsInBackground() {
		loadingPreviews = true;
		try {
			for (const scene of characterScenes) {
				if (!scene.previewUrl) {
					scene.previewUrl = (await fetchExScenePreview(scene.id)) || undefined;
				}
			}
			// Trigger reactivity
			characterScenes = characterScenes;
		} catch (err) {
			console.error('Failed to load scene previews:', err);
		} finally {
			loadingPreviews = false;
		}
	}
</script>

{#if loading}
	<div class="flex justify-center py-12">
		<p class="text-gray-600">Loading character...</p>
	</div>
{:else if error}
	<div class="rounded-lg border border-red-300 bg-red-50 p-4">
		<p class="text-red-800">Error: {error}</p>
	</div>
{:else if character}
	<div class="mx-auto max-w-4xl space-y-6 p-6">
		<!-- Header -->
		<div class="flex flex-col gap-6 md:flex-row">
			<div class="flex-shrink-0">
				<img
					src={`https://assets4.mist-train-girls.com/production-client-web-assets/Textures/Characters/ScenarioPhrase/${character.Id}.png`}
					alt={character.Name}
					class="h-64 w-64 rounded-lg object-cover shadow-md"
				/>
			</div>

			<div class="flex-1 space-y-4">
				<div>
					<h1 class="text-3xl font-bold">{character.Name}</h1>
					<p class="text-gray-600">{character.MCharacterBase.Name}</p>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-sm text-gray-600">Race</p>
						<p class="font-semibold">{character.MCharacterBase.Race}</p>
					</div>
					<div>
						<p class="text-sm text-gray-600">Country</p>
						<p class="font-semibold">{character.MCharacterBase.Country}</p>
					</div>
					<div>
						<p class="text-sm text-gray-600">Birthday</p>
						<p class="font-semibold">{character.MCharacterBase.Birthday}</p>
					</div>
					<div>
						<p class="text-sm text-gray-600">Rarity</p>
						<p class="font-semibold">★ {character.MCharacterRarity.CharacterRarity}</p>
					</div>
				</div>

				{#if character.MCharacterBase.Profile}
					<div>
						<p class="text-sm text-gray-600">Profile</p>
						<p class="text-sm">{character.MCharacterBase.Profile}</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Scenes Section -->
		<div class="space-y-4">
			<div>
				<h2 class="text-2xl font-bold">Scenes</h2>
				<p class="text-gray-600">
					{characterScenes.length} scene{characterScenes.length !== 1 ? 's' : ''}
				</p>
			</div>

			{#if characterScenes.length === 0}
				<p class="text-gray-600">No scenes found for this character.</p>
			{:else}
				<div class="space-y-4">
					{#if loadingPreviews}
						<div class="flex items-center gap-2 text-sm text-gray-600">
							<div class="animate-spin">⟳</div>
							<span>Loading scene previews...</span>
						</div>
					{/if}
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each characterScenes as scene (scene.id)}
							<a
								href={`/ex-scene?frameId=${encodeURIComponent(scene.id)}`}
								class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-300"
							>
								<!-- Preview Image -->
								{#if scene.previewUrl === undefined && loadingPreviews}
									<!-- Loading state -->
									<div
										class="flex h-40 w-full animate-pulse items-center justify-center bg-gray-100"
									>
										<div class="h-12 w-12 rounded-full bg-gray-300"></div>
									</div>
								{:else if scene.previewUrl}
									<!-- Loaded preview -->
									<div class="relative flex flex-grow items-center justify-center bg-gray-100">
										<img
											src={scene.previewUrl}
											alt={scene.title}
											class="h-full w-full object-contain"
											onerror={(e) => (e.target!.style.display = 'none')}
										/>
									</div>
								{:else}
									<!-- No preview available -->
									<div
										class="flex h-40 w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
									>
										<span class="text-sm text-gray-400">No preview</span>
									</div>
								{/if}

								<!-- Scene Info -->
								<div class="p-4">
									<h3 class="line-clamp-2 font-semibold text-gray-900">
										{scene.title} <span class="text-xs text-gray-600">({scene.id})</span>
									</h3>
									<div class="mt-3 flex items-center justify-between">
										<div>
											{#if scene.isAdult}
												<p class="text-xs font-semibold text-red-600">🔞 Adult Content</p>
											{/if}
										</div>
										<span class="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
											Rank {scene.kizunaRank}
										</span>
									</div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Back Button -->
		<div class="pt-4">
			<button
				onclick={() => {
					history.back();
				}}
				class="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 transition-all hover:border-blue-500 hover:bg-blue-50"
			>
				← Back to Characters
			</button>
		</div>
	</div>
{:else}
	<div class="flex justify-center py-12">
		<p class="text-gray-600">Character not found</p>
	</div>
{/if}
