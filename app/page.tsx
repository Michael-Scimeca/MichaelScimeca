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
        <main className="min-h-screen relative" style={{ backgroundColor: 'rgb(229, 229, 229)' }}>
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
                        "email": "mikeyscimeca@gmail.com"
                    })
                }}
            />

            {/* Hero Section */}
            <div className="mx-auto px-6 py-7 relative z-10" style={{ maxWidth: '1440px' }}>
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-white rounded-full p-[5px] fade-in-up">
                        <div className="rounded-full bg-slate-700 overflow-hidden" style={{ width: '150px', height: '150px' }}>
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
                    <div className="bg-white border border-gray-200 px-6 py-2 rounded-full shadow-sm -mt-3 fade-in-up-delay-1">
                        <span className="text-sm font-medium text-gray-900">Michael Scimeca</span>
                    </div>
                </div> 

                {/* Main Heading */}
                <h1 className="font-regular text-center mb-8 leading-tight fade-in-up-delay-2" style={{ fontSize: 'clamp(32px, calc(32px + (61 - 32) * ((100vw - 360px) / (1440 - 360))), 61px)' }}>
                <div>Full-Stack Web Developer & </div><div>AI Automation Specialist</div>
                </h1>
                <div className="!flex justify-center items-center gap-4 text-[#00000080] mb-8 fade-in-up-delay-3">
                    <p className="max-w-[70ch] text-center leading-relaxed">I help startups and brands create beautiful, high-performing digital products — blending WordPress, HTML, CSS, JavaScript, Next.js, and AI automation to craft seamless, intelligent web experiences that merge creativity, technology, and strategy for lasting impact.</p>
                </div>
                {/* CTA Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    <div className={`bg-white rounded-full shadow-lg p-1 transition-all duration-500 hover:translate-y-[1px] hover:shadow-[0_0px_1px_rgba(0,0,0,0.2)] ${isMomentReady ? 'fade-in-up-delay-4' : 'opacity-0'}`} style={{ willChange: 'transform' }}>
                        <a
                            href={`mailto:mikeyscimeca@gmail.com?subject=${encodeURIComponent(emailSubject)}`}
                            className="text-white px-6 py-3 rounded-full font-large transition-colors flex items-center gap-2 email-button"
                            style={{ backgroundColor: 'rgb(10, 102, 194)' }}
                        >
                      
                            {isDaytime ? (
                                <div className="flex items-center justify-center relative" style={{ width: '35px', height: '35px' }}>
                                    <img src="/image/sun.png" alt="Sun" className="sun-rotate" style={{ width: '25px', height: '25px' }}></img>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center relative" style={{ width: '35px', height: '35px' }}>
                                    <img src="/image/moon.png" alt="Moon" style={{ width: '25px', height: '25px' }}></img>
                                    <span className="sparkle-dot" style={{ top: '3px', left: '-6px', animationDelay: '0s', animationDuration: '3.5s' }}></span>
                                    <span className="sparkle-dot" style={{ top: '14px', left: '19px', animationDelay: '0.3s', animationDuration: '4.2s' }}></span>
                                    <span className="sparkle-dot" style={{ top: '27px', left: '4px', animationDelay: '0.7s', animationDuration: '3.0s' }}></span>
                                    <span className="sparkle-dot" style={{ top: '6px', left: '22px', animationDelay: '1.1s', animationDuration: '4.5s' }}></span>
                                    <span className="sparkle-dot" style={{ top: '22px', left: '-5px', animationDelay: '1.4s', animationDuration: '3.8s' }}></span>
                                    <span className="sparkle-dot" style={{ top: '10px', left: '12px', animationDelay: '0.2s', animationDuration: '4.0s' }}></span>
                                </div>
                            )}
                            {buttonText}
                        </a>
                    </div>
                    <a
                        href="https://www.linkedin.com/in/mikey-scimeca/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`bg-white text-gray-900 px-8 py-4 rounded-full font-medium border border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2 duration-500  shadow-lg hover:translate-y-[1px] hover:shadow-[0_0px_1px_rgba(0,0,0,0.2)] ${isMomentReady ? 'fade-in-up-delay-5' : 'opacity-0'}`}
                        style={{ willChange: 'transform' }}
                    >
                        <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        LinkedIn
                    </a>
                </div>

                {/* Portfolio Text with Embedded Images */}
                <div className="relative bg mx-auto mb-20">
                    <div className="wrap-i leading-tight text-center space-y-4">
           
                    
                                <span className="fade-in-up-delay-6">From</span>
                                <span className="fade-in-up-delay-7">Patreon</span>
                                <div className="inline-block relative fade-in-up-delay-8" style={{ left: '-10px', zIndex: 12 }}>
                                    <div 
                                        className="video-thumbnail position-relative inline-block rounded-[10px] overflow-hidden shadow-xl relative video-shadow cursor-pointer hover:opacity-90 transition-opacity" 
                                        style={{ width: 'clamp(170px, 18vw, 290px)', height: 'clamp(113px, 12vw, 193px)', transform: 'rotate(2deg)', zIndex: 12 }}
                                        onClick={(e) => handleVideoClick('/video/patreon.mp4', e)}
                                        onMouseEnter={handleAudioStart}
                                        data-video="0"
                                    >
                                        <video
                                            src="/video/patreon.mp4"
                                            className="w-full h-full object-cover relative"
                                            style={{ zIndex: 12 }}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                        />
                                        {/* Stars inside video */}
                                        {stars.filter(star => star.videoIndex === 0).map(star => (
                                            <img
                                                key={star.id}
                                                src="/image/star-black.png"
                                                alt=""
                                                className="absolute pointer-events-none star-pop"
                                                style={{
                                                    left: star.x,
                                                    top: star.y,
                                                    width: '15px',
                                                    height: '15px',
                                                    zIndex: 10
                                                }}
                                            />
                                        ))}
                                    </div>
                                    {/* Black stars around video */}
                                    {outerStars.filter(star => star.videoIndex === 0).map(star => (
                                        <img
                                            key={star.id}
                                            src="/image/star-black.png"
                                            alt=""
                                            className="absolute pointer-events-none star-pop"
                                            style={{
                                                left: star.x,
                                                top: star.y,
                                                width: '8px',
                                                height: '8px',
                                                zIndex: 10
                                            }}
                                        />
                                    ))}
                                </div>
                          

                                <span className="fade-in-up-delay-9">To</span>
                                <span className="fade-in-up-delay-10">Twix</span>
                                <span className="fade-in-up-delay-11">NFT</span>
                                
                                <div className="inline-block relative fade-in-up-delay-12" style={{ left: '-10px', zIndex: 12 }}>
                                    <div 
                                        className="video-thumbnail inline-block rounded-[10px] overflow-hidden relative video-shadow cursor-pointer hover:opacity-90 transition-opacity " 
                                        style={{ width: 'clamp(170px, 18vw, 290px)', height: 'clamp(113px, 12vw, 193px)', transform: 'rotate(0deg)', zIndex: 12 }}
                                        onClick={(e) => handleVideoClick('/video/twix.mp4', e)}
                                        onMouseEnter={handleAudioStart}
                                        data-video="1"
                                    >
                                        <video
                                            src="/video/twix.mp4"
                                            className="w-full h-full object-cover relative"
                                            style={{ zIndex: 12 }}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                        />
                                        {/* Stars inside video */}
                                        {stars.filter(star => star.videoIndex === 1).map(star => (
                                            <img
                                                key={star.id}
                                                src="/image/star-black.png"
                                                alt=""
                                                className="absolute pointer-events-none star-pop"
                                                style={{
                                                    left: star.x,
                                                    top: star.y,
                                                    width: '25px',
                                                    height: '25px',
                                                    zIndex: 10
                                                }}
                                            />
                                        ))}
                                    </div>
                                    {/* Black stars around video */}
                                    {outerStars.filter(star => star.videoIndex === 1).map(star => (
                                        <img
                                            key={star.id}
                                            src="/image/star-black.png"
                                            alt=""
                                            className="absolute pointer-events-none star-pop"
                                            style={{
                                                left: star.x,
                                                top: star.y,
                                                width: '7px',
                                                height: '7px',
                                                zIndex: 10
                                            }}
                                        />
                                    ))}
                                </div>
                             
                            
                                <span className="fade-in-up-delay-13">&</span>
                                <span className="fade-in-up-delay-14">Wealth</span>
                                <span className="fade-in-up-delay-15">Management</span>
                                <span className="fade-in-up-delay-16">Kovitz</span>
                                <div className="inline-block relative fade-in-up-delay-17" style={{ left: '-10px', zIndex: 12 }}>
                                    <div 
                                        className="video-thumbnail inline-block rounded-[10px] overflow-hidden relative video-shadow cursor-pointer hover:opacity-90 transition-opacity" 
                                        style={{ width: 'clamp(170px, 18vw, 290px)', height: 'clamp(113px, 12vw, 193px)', transform: 'rotate(-2deg)', zIndex: 12 }}
                                        onClick={(e) => handleVideoClick('/video/kovitz.mp4', e)}
                                        onMouseEnter={handleAudioStart}
                                        data-video="2"
                                    >
                                        <video
                                            src="/video/kovitz.mp4"
                                            className="w-full h-full object-cover relative"
                                            style={{ zIndex: 12}}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                        />
                                        {/* Stars inside video */}
                                        {stars.filter(star => star.videoIndex === 2).map(star => (
                                            <img
                                                key={star.id}
                                                src="/image/star-black.png"
                                                alt=""
                                                className="absolute pointer-events-none star-pop"
                                                style={{
                                                    left: star.x,
                                                    top: star.y,
                                                    width: '5px',
                                                    height: '5px',
                                                    zIndex: 10
                                                }}
                                            />
                                        ))}
                                    </div>
                                    {/* Black stars around video */}
                                    {outerStars.filter(star => star.videoIndex === 2).map(star => (
                                        <img
                                            key={star.id}
                                            src="/image/star-black.png"
                                            alt=""
                                            className="absolute pointer-events-none star-pop"
                                            style={{
                                                left: star.x,
                                                top: star.y,
                                                width: '5px',
                                                height: '5px',
                                                zIndex: 10
                                            }}
                                        />
                                    ))}
                                </div>
                    

                        </div>
                    </div>
                    <footer className="text-center fade-in-up-delay-18">
                    <p className="text-gray-600 text-sm">
                        Michael Scimeca. All Rights Reserved.
                    </p>
                </footer>
                </div>

             {/* Footer */}
         

                {/* Video Modal */}
                {activeVideo && clickPosition && (
                    <div 
                        className={`fixed inset-0 bg-black modal-backdrop ${isClosing ? 'closing' : ''}`}
                        style={{ zIndex: 1000 }}
                        onClick={handleCloseModal}
                    >
                        <div 
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
                                    <h3 className="text-left mb-4 font-lora text-5xl text-gray-900">
                                        {projectContent[activeVideo]?.title}
                                    </h3>
                                    <p className="text-left text-gray-600 leading-relaxed">
                                        {projectContent[activeVideo]?.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

           
            </main>
        );
    }

