export default function HeroVideoBackground() {
  return (
    <div className="absolute inset-0" style={{ zIndex: -10 }}>
      {/* Modern Gradient Background with more color */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100"></div>

      {/* Animated Mesh Gradient Overlay - More visible */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute top-0 -left-4 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-[500px] h-[500px] bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-[500px] h-[500px] bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-20 w-[500px] h-[500px] bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
      </div>

      {/* Additional Gradient Orbs for Depth */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-400 to-orange-500 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      ></div>

      {/* Dot Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      ></div>

      {/* Floating Geometric Elements - More prominent */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top Left Decorations */}
        <div className="absolute top-20 left-10 w-48 h-48 border-4 border-purple-300/40 rounded-full opacity-40 animate-spin-slow"></div>
        <div className="absolute top-40 left-32 w-24 h-24 bg-gradient-to-br from-amber-400 to-pink-500 rounded-lg opacity-30 animate-float shadow-2xl" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-60 left-20 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-25 animate-bounce-slow"></div>

        {/* Top Right Decorations */}
        <div className="absolute top-32 right-20 w-40 h-40 border-4 border-amber-300/40 rounded-lg rotate-45 opacity-40 animate-pulse-slow"></div>
        <div className="absolute top-60 right-40 w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full opacity-30 animate-float shadow-xl" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-96 right-28 w-32 h-32 border-4 border-pink-300/40 rounded-full opacity-35 animate-spin-slow"></div>

        {/* Middle Decorations */}
        <div className="absolute top-1/2 left-16 w-28 h-28 bg-gradient-to-br from-pink-400 to-orange-500 rounded-lg rotate-12 opacity-25 animate-float shadow-2xl" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 right-20 w-36 h-36 border-4 border-blue-300/40 rounded-lg rotate-45 opacity-40 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

        {/* Bottom Decorations */}
        <div className="absolute bottom-40 left-1/4 w-32 h-32 border-4 border-pink-300/40 rounded-full opacity-35 animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg rotate-12 opacity-30 animate-float shadow-2xl" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-25 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

        {/* Additional scattered elements */}
        <div className="absolute top-1/3 right-1/4 w-20 h-20 border-4 border-purple-300/40 rounded-lg rotate-45 opacity-30 animate-spin-slow"></div>
        <div className="absolute bottom-1/3 left-1/3 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-25 animate-bounce-slow" style={{ animationDelay: '4s' }}></div>
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
