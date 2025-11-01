<script lang="ts">
	const subpages = [
		{
			name: 'Characters',
			description: 'Browse and search Mist Train Girls characters',
			href: '/characters'
		}
	];
</script>

<div class="mx-auto max-w-4xl p-6">
	<div class="mb-8">
		<h1 class="mb-2 text-4xl font-bold">Mist Train Girls</h1>
		<p class="text-gray-600">Scene and character viewer</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
		{#each subpages as page}
			<a
				href={page.href}
				class="group rounded-lg border border-gray-300 bg-white p-6 shadow-md transition-all hover:border-blue-500 hover:shadow-lg"
			>
				<h2 class="mb-2 text-xl font-semibold group-hover:text-blue-600">{page.name}</h2>
				<p class="text-gray-600">{page.description}</p>
			</a>
		{/each}
	</div>
</div>
