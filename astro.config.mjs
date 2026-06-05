// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Kairosis',
			description: 'Self-hosted event collection and normalization platform',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/pascalwilbrink/kairosis' }],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
					],
				},
				{
					label: 'Architecture',
					items: [
						{ label: 'Overview', slug: 'architecture/overview' },
						{ label: 'Event Flow', slug: 'architecture/event-flow' },
						{ label: 'Normalized Events', slug: 'architecture/normalized-events' },
					],
				},
				{
					label: 'Connectors',
					items: [
						{ label: 'Overview', slug: 'connectors/overview' },
						{ label: 'Webhook Connectors', slug: 'connectors/webhook' },
						{ label: 'Poller Connectors', slug: 'connectors/poller' },
						{ label: 'Building a Connector', slug: 'connectors/building' },
					],
				},
				{
					label: 'Connector Catalog',
					items: [{ autogenerate: { directory: 'connectors/catalog' } }],
				},
				{
					label: 'Event Packages',
					items: [{ autogenerate: { directory: 'events' } }],
				},
				{
					label: 'API Reference',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
		}),
	],
});
