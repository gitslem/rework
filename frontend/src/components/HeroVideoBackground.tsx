'use client';

export default function HeroVideoBackground() {
  return (
    <div className="absolute inset-0" style={{ zIndex: -10 }}>
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900"></div>

      {/* Video Background Layer */}
      <div className="absolute inset-0 w-full h-full opacity-30">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
          <source src="/Remote-Worksio.Intro-mp4.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Animated Mesh Gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/30 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/30 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-blue-500/30 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Tech Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      ></div>

      {/* Floating Tech Icons - Work From Home Theme */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {/* Code Brackets */}
        <div className="absolute top-32 left-20 text-6xl font-mono text-purple-300 animate-float">{'<>'}</div>
        <div className="absolute top-64 right-32 text-5xl font-mono text-pink-300 animate-float" style={{ animationDelay: '1s' }}>{'{ }'}</div>

        {/* AI Symbols */}
        <div className="absolute top-48 right-16 text-7xl font-bold text-blue-300 animate-pulse-slow">AI</div>
        <div className="absolute bottom-48 left-24 text-6xl font-bold text-purple-300 animate-pulse-slow" style={{ animationDelay: '2s' }}>ML</div>

        {/* Work From Home Icons Representation */}
        <div className="absolute top-1/4 left-1/4 w-20 h-20 border-4 border-purple-300 rounded-lg rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-16 h-16 border-4 border-pink-300 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 border-4 border-blue-300 rounded-lg animate-bounce-slow"></div>
      </div>

      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 30px) scale(0.9); }
          75% { transform: translate(50px, 20px) scale(1.05); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }

        .animate-blob {
          animation: blob 25s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
