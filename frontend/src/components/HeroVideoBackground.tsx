'use client';

export default function HeroVideoBackground() {
  return (
    <div className="absolute inset-0" style={{ zIndex: -10 }}>
      {/* Video Background Layer */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
          <source src="/Remote-Worksio.Intro-mp4.mp4" type="video/mp4" />
        </video>

        {/* Warm overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 251, 235, 0.85) 0%, rgba(254, 243, 199, 0.80) 50%, rgba(253, 230, 138, 0.75) 100%)',
            backdropFilter: 'blur(2px)'
          }}
        ></div>
      </div>

      {/* Warm gradient overlay blobs */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-blob {
          animation: blob 20s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-6000 {
          animation-delay: 6s;
        }

        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
