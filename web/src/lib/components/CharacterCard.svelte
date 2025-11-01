<script lang="ts">
	import type { Character } from '../api/characters';

	interface Props {
		character: Character;
	}

	let { character }: Props = $props();
</script>

<div class="flex flex-col gap-2 rounded-lg border border-gray-300 p-4 shadow-md">
	<img
		src={character.profileImageUrl}
		alt={character.name}
		class="h-48 w-full rounded object-cover"
		loading="lazy"
	/>
	<h3 class="text-lg font-semibold">{character.name}</h3>
</div>
