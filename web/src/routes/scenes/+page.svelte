<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchAllExScenes, type ExSceneInfo } from '$lib/api/scenes';

	let scenes: ExSceneInfo[] = [];
	let loading = true;
	let error: string | null = null;
	let progress = { current: 0, total: 0 };

	onMount(async () => {
		try {
			scenes = await fetchAllExScenes(9, (current, total) => {
				progress = { current, total };
			});
			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load scenes';
			loading = false;
		}
	});

	function handleSceneClick(frameId: string) {
		window.location.href = `/ex-scene?frameId=${encodeURIComponent(frameId)}`;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold">EX Scenes</h1>

	{#if loading}
		<div class="flex flex-col items-center justify-center py-12">
			<div class="mb-2 text-lg">Loading EX Scenes...</div>
			{#if progress.total > 0}
				<div class="text-sm text-gray-600">
					Processing atlas {progress.current} of {progress.total}
				</div>
				<div class="mt-4 h-2 w-64 overflow-hidden rounded-full bg-gray-200">
					<div
						class="h-full bg-blue-500 transition-all duration-300"
						style="width: {(progress.current / progress.total) * 100}%"
					></div>
				</div>
			{/if}
		</div>
	{:else if error}
		<div class="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
			<p class="font-bold">Error</p>
			<p>{error}</p>
		</div>
	{:else}
		<div class="mb-4 text-gray-600">
			Found {scenes.length} EX scenes
		</div>

		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each scenes as scene (scene.frameId)}
				<button
					class="flex cursor-pointer flex-col items-center rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-lg"
					on:click={() => handleSceneClick(scene.frameId)}
				>
					{#if scene.previewUrl}
						<img
							src={scene.previewUrl}
							alt="Scene {scene.frameId}"
							class="mb-2 h-auto w-full rounded object-contain"
							loading="lazy"
						/>
					{:else}
						<div
							class="mb-2 flex aspect-square w-full items-center justify-center rounded bg-gray-100"
						>
							<span class="text-sm text-gray-400">No preview</span>
						</div>
					{/if}
					<div class="text-sm font-medium text-gray-800">{scene.frameId}</div>
					<div class="text-xs text-gray-500">Scene: {scene.sceneId}</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
