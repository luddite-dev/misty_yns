<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchCharactersFullData } from '$lib/api/characters';
	import { fetchScenes, getCharacterScenes } from '$lib/api/scenes';
	import type { TopLevel as Character } from '$lib/types/characters';
	import type { CharacterScene } from '$lib/api/scenes';

	let character: Character | null = $state(null);
	let characterScenes: CharacterScene[] = $state([]);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);

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
			const [characters, scenes] = await Promise.all([
				fetchCharactersFullData(),
				fetchScenes()
			]);

			// Find the character
			character = characters.find((c) => c.Id === characterId) || null;

			if (!character) {
				error = 'Character not found';
				loading = false;
				return;
			}

			// Get scenes for this character
			characterScenes = getCharacterScenes(character, scenes);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load character';
		} finally {
			loading = false;
		}
	});
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
				<div class="space-y-2">
					{#each characterScenes as scene (scene.id)}
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<div class="flex items-center justify-between">
								<div class="flex-1">
									<h3 class="font-semibold">{scene.title}</h3>
									{#if scene.isAdult}
										<p class="text-xs text-red-600 font-semibold">🔞 Adult Content</p>
									{/if}
								</div>
								<span class="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
									Rank {scene.kizunaRank}
								</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Back Button -->
		<div class="pt-4">
			<a
				href="/characters"
				class="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 transition-all hover:border-blue-500 hover:bg-blue-50"
			>
				← Back to Characters
			</a>
		</div>
	</div>
{:else}
	<div class="flex justify-center py-12">
		<p class="text-gray-600">Character not found</p>
	</div>
{/if}