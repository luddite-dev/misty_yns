<script lang="ts">
	import type { Character } from '../api/characters';

	interface Props {
		character: Character;
	}

	let { character }: Props = $props();
</script>

<a
	href={`/character?id=${character.id}`}
	class="group flex flex-col gap-2 rounded-lg border border-gray-300 p-4 shadow-md transition-all hover:border-blue-500 hover:shadow-lg"
>
	<img
		src={character.profileImageUrl}
		alt={character.name}
		class="h-48 w-full rounded object-cover"
		loading="lazy"
	/>
	<h3 class="text-lg font-semibold group-hover:text-blue-600">{character.name}</h3>
</a>
