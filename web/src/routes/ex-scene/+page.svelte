<script lang="ts">
	import { onMount } from 'svelte';

	let frameId: string | null = null;
	let iframeUrl: string | null = null;

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		frameId = params.get('frameId');

		if (frameId) {
			// Build the SpineViewer URL with the frameId parameter
			iframeUrl = `/SpineViewer/index.html?frameId=${encodeURIComponent(frameId)}`;
		}
	});
</script>

<div class="flex flex-col h-screen w-screen">
	{#if !frameId}
		<div class="flex items-center justify-center h-full">
			<p class="text-gray-600 text-lg">No frameId provided</p>
		</div>
	{:else if iframeUrl}
		<iframe
			src={iframeUrl}
			title="Ex Scene Viewer"
			class="w-full h-full border-0"
			allow="fullscreen"
		></iframe>
	{:else}
		<div class="flex items-center justify-center h-full">
			<p class="text-gray-600 text-lg">Loading...</p>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
