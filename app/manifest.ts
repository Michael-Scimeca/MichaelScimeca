import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Michael Scimeca | Full-Stack Web Developer',
        short_name: 'Mikey Scimeca',
        description: 'Full-stack web developer and AI automation specialist helping startups and brands create beautiful, high-performing digital products.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0F172A',
        theme_color: '#0F172A',
        icons: [
            {
                src: '/icon',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    }
}
