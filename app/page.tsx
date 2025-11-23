"use client";

import { useState, useEffect, useRef } from 'react';
import moment from 'moment';

export default function Home() {
    const [isAvailable, setIsAvailable] = useState(false);
    const [isDaytime, setIsDaytime] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMomentReady, setIsMomentReady] = useState(false);
    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const clickAudioRef = useRef<HTMLAudioElement>(null);
    const [stars, setStars] = useState<{ id: number; x: string; y: string; videoIndex: number }[]>([]);
    const [outerStars, setOuterStars] = useState<{ id: number; x: string; y: string; videoIndex: number }[]>([]);
    const [isClosing, setIsClosing] = useState(false);

    // Background colors array
    const backgroundColors = [
        "#0F172A", // Deep Navy
        "#1E293B", // Slate Blue
        "#000000", // Black
        "#204d96", // Dark Blue
        "#111819"  // Dark Gray
    ];

    // Set click sound volume
    useEffect(() => {
        if (clickAudioRef.current) {
            clickAudioRef.current.volume = 0.1; // 30% volume
        }
    }, []);

    useEffect(() => {
        // Function to check if current time is between 8:30 AM and 1:00 AM AND it's a weekday
        const checkAvailability = () => {
            const now = moment();
            const currentHour = now.hour();
            const currentMinute = now.minute();
            const dayOfWeek = now.day(); // 0 = Sunday, 6 = Saturday

            // Check if it's a weekday (Monday = 1 to Friday = 5)
            const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

            // Check if time is between 8:30 AM and 1:59 AM (next day)
            // Available: 8:30 AM to 11:59 PM OR 12:00 AM to 1:59 AM
            // Not available: 2:00 AM to 8:29 AM
            const isInTimeRange =
                (currentHour > 8 || (currentHour === 8 && currentMinute >= 30)) ||
                (currentHour >= 0 && currentHour < 2);

            // Available only if it's a weekday AND within time range
            setIsAvailable(isWeekday && isInTimeRange);

            // Check if it's daytime (8 AM to 5:30 PM)
            const isDaytimeHours = currentHour >= 8 && (currentHour < 17 || (currentHour === 17 && currentMinute < 30));
            setIsDaytime(isDaytimeHours);

            // Mark as loaded after first check
            setIsLoaded(true);
            
            // Mark moment as ready after first check
            if (!isMomentReady) {
                setIsMomentReady(true);
            }
        };

        // Check immediately
        checkAvailability();

        // Check every minute
        const interval = setInterval(checkAvailability, 60000);

        return () => clearInterval(interval);
    }, [isMomentReady]);

    // ESC key to close modal and prevent body scroll
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleCloseModal();
            }
        };

        if (activeVideo) {
            window.addEventListener('keydown', handleEsc);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [activeVideo]);

    // Handle modal closing animation
    useEffect(() => {
        if (isClosing) {
            // Wait for animation to complete before actually closing
            const timer = setTimeout(() => {
                setActiveVideo(null);
                setIsClosing(false);
            }, 400); // Match the animation duration in CSS

            return () => clearTimeout(timer);
        }
    }, [isClosing]);

    // Random star pop-ups within video thumbnails
    useEffect(() => {
        const createStarsInVideos = () => {
            const videoElements = document.querySelectorAll('.video-thumbnail');
            
            videoElements.forEach((video, index) => {
                // Random position within the video thumbnail (percentage-based)
                const x = `${Math.random() * 100}%`;
                const y = `${Math.random() * 100}%`;
                
                const id = Date.now() + Math.random();
                setStars(prev => [...prev, { id, x, y, videoIndex: index }]);
                
                // Remove star after animation completes
                setTimeout(() => {
                    setStars(prev => prev.filter(star => star.id !== id));
                }, 2500);
            });
        };

        // Create stars every 500-1500ms
        const interval = setInterval(() => {
            createStarsInVideos();
        }, Math.random() * 1000 + 500);

        return () => clearInterval(interval);
    }, []);

    // Black stars around video thumbnails (outside bounds)
    useEffect(() => {
        const createOuterStars = () => {
            const videoElements = document.querySelectorAll('.video-thumbnail');
            
            videoElements.forEach((video, index) => {
                // Random position around the perimeter (outside the video)
                const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
                let x, y;
                
                switch(side) {
                    case 0: // top
                        x = `${Math.random() * 100}%`;
                        y = '-10px';
                        break;
                    case 1: // right
                        x = 'calc(100% + 10px)';
                        y = `${Math.random() * 100}%`;
                        break;
                    case 2: // bottom
                        x = `${Math.random() * 100}%`;
                        y = 'calc(100% + 10px)';
                        break;
                    case 3: // left
                    default:
                        x = '-10px';
                        y = `${Math.random() * 100}%`;
                        break;
                }
                
                const id = Date.now() + Math.random();
                setOuterStars(prev => [...prev, { id, x, y, videoIndex: index }]);
                
                // Remove star after animation completes
                setTimeout(() => {
                    setOuterStars(prev => prev.filter(star => star.id !== id));
                }, 2500);
            });
        };

        // Create outer stars every 600-1200ms
        const interval = setInterval(() => {
            createOuterStars();
        }, Math.random() * 600 + 600);

        return () => clearInterval(interval);
    }, []);

    const buttonText = isDaytime ? "Let's get in touch today!" : "Say Hi Tonight!";
    const emailSubject = isAvailable ? "Are you free" : "Say Hi!";

    // Project content for each video
    const projectContent: { [key: string]: { title: string; description: string } } = {
        '/video/patreon.mp4': {
            title: 'Patreon',
            description: 'For Halloween 2021, we teamed up with Patreon to celebrate the thrill of true crime content in a way fans wouldn’t forget. The result was Trick-or-True Crime—an interactive microsite that invited visitors to wander through eerie, crime-ridden streets filled with mystery and suspense. Behind every door lurked either a chilling surprise or an enticing prize, creating a playful balance of fear and fun. Featuring immersive Lottie animations and horizontal scrolling, the experience blended storytelling and technology to capture the spirit of Halloween with a dark, cinematic edge.'
        },
        '/video/twix.mp4': {
            title: 'Twix NFT',
            description: 'That’s the question we set out to answer with our friends at Mars, Inc. Partnering with their PR agency, we crafted a digital experience that brought the legendary rivalry to life in a bold new way. Enter #NFTwix—TWIX’s first-ever NFT drop. Together with artist YEAHYEAHCHLOE and hosted on MakersPlace, we transformed the candy showdown into a digital art moment: two identical-looking pieces that were provably unique on the blockchain. To amplify the campaign, we built a sleek split-screen website where fans could choose their side and compete for exclusive prizes.'
        },
        '/video/kovitz.mp4': {
            title: 'Kovitz Wealth Management',
            description: "Kovitz, a value-driven wealth management firm based in Chicago, sought a website that would differentiate them from traditional financial services brands. Our mission was to craft a distinctive digital presence that embodied Kovitz’s commitment to long-term value while presenting their philosophy in a fresh, engaging way. Built with HTML, Sass, JavaScript, Vue.js, and Prismic, the site combines striking drone footage, custom illustrations, and thoughtful design patterns to bring their story to life. Every detail reinforces Kovitz’s core values and sets them apart in a competitive industry."

        }
    };

    const handleAudioStart = () => {
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(err => console.log('Audio play failed:', err));
        }
    };

    const handleVideoClick = (videoSrc: string, event: React.MouseEvent<HTMLDivElement>) => {
        // Play click sound
        if (clickAudioRef.current) {
            clickAudioRef.current.currentTime = 0; // Reset to start
            clickAudioRef.current.play().catch(err => console.log('Click sound failed:', err));
        }
        
        const rect = event.currentTarget.getBoundingClientRect();
        setClickPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height
        });
        setActiveVideo(videoSrc);
    };

    const handleCloseModal = () => {
        // Play click sound
        if (clickAudioRef.current) {
            clickAudioRef.current.currentTime = 0; // Reset to start
            clickAudioRef.current.play().catch(err => console.log('Click sound failed:', err));
        }
        setIsClosing(true);
    };

    return (
        <main className="min-h-screen relative" >
            {/* Background Sound */}
            {/* <audio ref={audioRef} loop>
                <source src="/sound/bg-sound.mp3" type="audio/mpeg" />
            </audio> */}
            
            {/* Click Sound */}
            <audio ref={clickAudioRef} preload="auto">
                <source src="/sound/click.mp3" type="audio/mpeg" />
            </audio>

            {/* JSON-LD Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Person",
                        "name": "Michael Scimeca",
                        "alternateName": "Mikey Scimeca",
                        "url": "https://michaelscimeca.com",
                        "image": "https://michaelscimeca.com/profile.jpg",
                        "jobTitle": "Full-Stack Web Developer & AI Automation Specialist",
                        "worksFor": {
                            "@type": "Organization",
                            "name": "Freelance"
                        },
                        "description": "Full-stack web developer and AI automation specialist helping startups and brands create beautiful, high-performing digital products.",
                        "knowsAbout": [
                            "Web Development",
                            "JavaScript",
                            "Next.js",
                            "React",
                            "WordPress",
                            "HTML",
                            "CSS",
                            "AI Automation",
                            "UI/UX Design"
                        ],
                        "sameAs": [
                            "https://www.linkedin.com/in/mikey-scimeca/"
                        ],
                        "email": "mikeyscimeca@gmail.com",
                        "address": {
                            "@type": "PostalAddress",
                            "addressCountry": "US"
                        }
                    })
                }}
            />

            {/* Portfolio Projects JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([
                        {
                            "@context": "https://schema.org",
                            "@type": "CreativeWork",
                            "name": "Patreon Trick-or-True Crime Campaign",
                            "description": "Interactive Halloween microsite featuring immersive Lottie animations and horizontal scrolling for Patreon's true crime content celebration.",
                            "creator": {
                                "@type": "Person",
                                "name": "Michael Scimeca"
                            },
                            "datePublished": "2021-10-31",
                            "keywords": "web development, interactive design, Lottie animations, Patreon"
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "CreativeWork",
                            "name": "Twix NFT Campaign",
                            "description": "Digital art and NFT campaign for Mars Inc. featuring TWIX's first-ever NFT drop with artist YEAHYEAHCHLOE, hosted on MakersPlace.",
                            "creator": {
                                "@type": "Person",
                                "name": "Michael Scimeca"
                            },
                            "keywords": "NFT, blockchain, web3, digital art, Twix, Mars Inc"
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "CreativeWork",
                            "name": "Kovitz Wealth Management Website",
                            "description": "Modern wealth management website built with HTML, Sass, JavaScript, Vue.js, and Prismic, featuring drone footage and custom illustrations.",
                            "creator": {
                                "@type": "Person",
                                "name": "Michael Scimeca"
                            },
                            "keywords": "Vue.js, Prismic, financial services, web design, Sass"
                        }
                    ])
                }}
            />

            {/* BreadcrumbList Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://michaelscimeca.com"
                            }
                        ]
                    })
                }}
            />

            {/* Hero Section */}
            <div className="relative z-10" style={{  maxWidth: '1440px', margin: '0 auto' }}>
            <div className="body-content my-8 mx-6 md:my-12 md:mx-12">
                {/* Profile Section */}
                <header className="flex flex-col items-start mb-8">
                    <div id="">
                        <div className="rounded-full  bg-slate-700 overflow-hidden" style={{ width: '150px', height: '150px' }}>
                            <img
                                src="/profile.jpg"
                                alt="Michael Scimeca"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white text-4xl font-bold">MS</div>';
                                }}
                            />
                        </div>
                    </div>
                   
                </header> 

                {/* Main Heading */}
                <h1 className="font-regular mb-4 leading-tight" style={{ fontSize: 'clamp(26px, calc(26px + (61 - 26) * ((100vw - 360px) / (1440 - 360))), 61px)', color: 'rgb(149, 156, 173)' }}>
                <div>Hi, I'm Mikey — Web Developer & </div><div>AI Automation Specialist</div>
                </h1>
                <div className="!flex gap-4 mb-8">
                    <p className="max-w-[70ch]"  style={{ fontSize: 'clamp(21px, calc(21px + (43 - 21) * ((100vw - 360px) / (1440 - 360))), 43px)', color: 'rgb(149, 156, 173)', lineHeight: '1.1' }}>For the past 15 years, I've had the pleasure of working with exceptional creatives, crafting beautiful, high-performing digital products for major brands—and in recent years, integrating AI automation to create even more seamless and intelligent experiences.</p>
                </div>
                {/* CTA Buttons */}
                <nav className="flex flex-wrap items-start gap-4 mb-10" aria-label="Contact and social links">
                    <a
                        href={`mailto:mikeyscimeca@gmail.com?subject=${encodeURIComponent(emailSubject)}`}
                        className="underline hover:opacity-80"
                        style={{ color: 'rgb(149, 156, 173)' }}
                    >
                        Email
                    </a>
                    <a
                        href="https://www.linkedin.com/in/mikey-scimeca/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80"
                        style={{ color: 'rgb(149, 156, 173)' }}
                    >
                        LinkedIn
                    </a>
                </nav>

                {/* Portfolio Section */}
                <section className="relative bg mx-auto mb-20" aria-label="Featured portfolio projects">
                    <h2 className="sr-only">Featured Portfolio Projects</h2>
                    
                    {/* Video Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            <video
                                src="/video/patreon.mp4"
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                                aria-label="Preview of Patreon Halloween campaign project"
                            />
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            <video
                                src="/video/twix.mp4"
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                                aria-label="Preview of Twix NFT campaign project"
                            />
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            <video
                                src="/video/kovitz.mp4"
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                                aria-label="Preview of Kovitz Wealth Management website project"
                            />
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            <video
                                src="/video/flipboard.mp4"
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                                aria-label="Preview of Kovitz Wealth Management website project"
                            />
                        </div>
                    </div>

                  
                    </section>
      </div>
                    <footer className="my-12 text-center">
                        <p className="text-sm" style={{ color: 'rgb(149, 156, 173)' }}>
                        {new Date().getFullYear()} Michael Scimeca
                        </p>
                    </footer>
                </div>
            {/* End Main Content Wrapper */}

                {/* Video Modal */}
                {activeVideo && clickPosition && (
                    <div 
                        className={`fixed inset-0 bg-black modal-backdrop ${isClosing ? 'closing' : ''}`}
                        style={{ zIndex: 1000 }}
                        onClick={handleCloseModal}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Project details"
                    >
                        <article 
                            className={`modal-content ${isClosing ? 'closing' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                '--start-x': `${clickPosition.x}px`,
                                '--start-y': `${clickPosition.y}px`,
                                '--start-width': `${clickPosition.width}px`,
                                '--start-height': `${clickPosition.height}px`,
                                zIndex: 1001,
                            } as React.CSSProperties}
                        >
                            {/* Close Button */}
                            <button
                                onClick={handleCloseModal}
                                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-[1002] group"
                                aria-label="Close modal"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Press ESC</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </button>
                    
                            <div className="rounded-2xl overflow-hidden shadow-2xl w-full h-full bg-white flex flex-col">
                                <div className="flex-1 bg-black">
                                    <video
                                        src={activeVideo}
                                        className="w-full h-full object-cover"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        controls
                                    />
                                </div>
                                
                                {/* Project Content */}
                                <div className="bg-white p-8">
                                    <h2 className="text-left mb-4 font-lora text-5xl" style={{ color: 'rgb(149, 156, 173)' }}>
                                        {projectContent[activeVideo]?.title}
                                    </h2>
                                    <p className="text-left leading-relaxed" style={{ color: 'rgb(149, 156, 173)' }}>
                                        {projectContent[activeVideo]?.description}
                                    </p>
                                </div>
                            </div>
                        </article>
                    </div>
                )}

           
            </main>
        );
    }

