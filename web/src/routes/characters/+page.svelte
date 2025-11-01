<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchCharacters } from '$lib/api/characters';
	import CharacterCard from '$lib/components/CharacterCard.svelte';
	import type { Character } from '$lib/api/characters';

	let characters: Character[] = $state([]);
	let searchQuery: string = $state('');
	let loading: boolean = $state(true);
	let error: string | null = $state(null);

	onMount(async () => {
		try {
			loading = true;
			characters = await fetchCharacters();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load characters';
		} finally {
			loading = false;
		}
	});

	let filteredCharacters: Character[] = $derived.by(() => {
		if (!searchQuery) return characters;

		return characters.filter((char) =>
			char.name.toLowerCase().includes(searchQuery.toLowerCase())
		);
	});
</script>

<div class="mx-auto max-w-7xl space-y-6 p-6">
	<div>
		<h1 class="mb-2 text-3xl font-bold">Characters</h1>
		<p class="text-gray-600">Browse and search Mist Train Girls characters</p>
	</div>

	{#if error}
		<div class="rounded-lg border border-red-300 bg-red-50 p-4">
			<p class="text-red-800">Error: {error}</p>
		</div>
	{/if}

	<div class="flex flex-col gap-4">
		<div class="relative">
			<input
				type="text"
				placeholder="Search characters by name..."
				bind:value={searchQuery}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		{#if loading}
			<div class="flex justify-center py-12">
				<p class="text-gray-600">Loading characters...</p>
			</div>
		{:else if filteredCharacters.length === 0}
			<div class="flex justify-center py-12">
				<p class="text-gray-600">
					{searchQuery ? 'No characters found matching your search.' : 'No characters available.'}
				</p>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each filteredCharacters as character (character.id)}
					<CharacterCard {character} />
				{/each}
			</div>
		{/if}
	</div>

	<p class="text-sm text-gray-500">
		Showing {filteredCharacters.length} of {characters.length} characters
	</p>
</div>
