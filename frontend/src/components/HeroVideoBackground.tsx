export default function HeroVideoBackground() {
  // Set to true to use animated background, false to try loading video
  const useAnimatedBackground = false;

  return (
    <div className="absolute inset-0 -z-10">
      {/* Video Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Video option - uncomment and set useAnimatedBackground to false to use video */}
        {!useAnimatedBackground && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto transform -translate-x-1/2 -translate-y-1/2 object-cover"
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
            <source src="/videos/hero-background.webm" type="video/webm" />
          </video>
        )}

        {/* Animated CSS Background */}
        {useAnimatedBackground && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Animated Workspace Illustration */}
            <svg
              className="absolute inset-0 w-full h-full opacity-30"
              viewBox="0 0 1920 1080"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Desk */}
              <rect
                x="400"
                y="700"
                width="1120"
                height="30"
                fill="#8B5CF6"
                opacity="0.15"
                rx="4"
              />

              {/* Monitor Stand */}
              <rect
                x="820"
                y="650"
                width="80"
                height="50"
                fill="#6B7280"
                opacity="0.1"
                rx="2"
              />

              {/* Monitor */}
              <g className="animate-float" style={{ animationDuration: '6s' }}>
                <rect
                  x="700"
                  y="400"
                  width="520"
                  height="320"
                  fill="#1F2937"
                  opacity="0.15"
                  rx="8"
                />
                <rect
                  x="720"
                  y="420"
                  width="480"
                  height="280"
                  fill="#F3F4F6"
                  opacity="0.2"
                  rx="4"
                />

                {/* Code Lines on Screen */}
                <g className="animate-pulse" style={{ animationDuration: '3s' }}>
                  <rect x="750" y="450" width="200" height="12" fill="#8B5CF6" opacity="0.3" rx="2" />
                  <rect x="750" y="475" width="300" height="12" fill="#F59E0B" opacity="0.3" rx="2" />
                  <rect x="750" y="500" width="250" height="12" fill="#10B981" opacity="0.3" rx="2" />
                  <rect x="750" y="525" width="180" height="12" fill="#8B5CF6" opacity="0.3" rx="2" />
                  <rect x="750" y="550" width="320" height="12" fill="#F59E0B" opacity="0.3" rx="2" />
                  <rect x="750" y="575" width="220" height="12" fill="#10B981" opacity="0.3" rx="2" />
                  <rect x="750" y="600" width="280" height="12" fill="#8B5CF6" opacity="0.3" rx="2" />
                  <rect x="750" y="625" width="200" height="12" fill="#F59E0B" opacity="0.3" rx="2" />
                </g>
              </g>

              {/* Coffee Cup */}
              <g className="animate-float" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                <ellipse cx="500" cy="680" rx="35" ry="12" fill="#6B7280" opacity="0.1" />
                <rect x="475" y="640" width="50" height="60" fill="#F59E0B" opacity="0.2" rx="4" />
                {/* Steam */}
                <path
                  d="M485 635 Q480 620 485 605"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.15"
                  className="animate-pulse"
                />
                <path
                  d="M500 635 Q495 620 500 605"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.15"
                  className="animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />
                <path
                  d="M515 635 Q510 620 515 605"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.15"
                  className="animate-pulse"
                  style={{ animationDelay: '1s' }}
                />
              </g>

              {/* Notebook */}
              <g className="animate-float" style={{ animationDuration: '7s', animationDelay: '2s' }}>
                <rect
                  x="1350"
                  y="620"
                  width="140"
                  height="100"
                  fill="#8B5CF6"
                  opacity="0.15"
                  rx="4"
                />
                <line x1="1360" y1="640" x2="1470" y2="640" stroke="#6B7280" strokeWidth="2" opacity="0.1" />
                <line x1="1360" y1="660" x2="1470" y2="660" stroke="#6B7280" strokeWidth="2" opacity="0.1" />
                <line x1="1360" y1="680" x2="1470" y2="680" stroke="#6B7280" strokeWidth="2" opacity="0.1" />
              </g>

              {/* Plant */}
              <g className="animate-float" style={{ animationDuration: '8s', animationDelay: '0.5s' }}>
                <ellipse cx="1600" cy="690" rx="45" ry="15" fill="#10B981" opacity="0.1" />
                <rect x="1575" y="670" width="50" height="40" fill="#F59E0B" opacity="0.15" rx="4" />
                <circle cx="1600" cy="630" r="40" fill="#10B981" opacity="0.2" />
                <circle cx="1580" cy="645" r="30" fill="#10B981" opacity="0.15" />
                <circle cx="1620" cy="645" r="30" fill="#10B981" opacity="0.15" />
              </g>

              {/* Keyboard */}
              <g className="animate-float" style={{ animationDuration: '6s', animationDelay: '1.5s' }}>
                <rect
                  x="850"
                  y="740"
                  width="220"
                  height="70"
                  fill="#6B7280"
                  opacity="0.1"
                  rx="4"
                />
                {/* Keys */}
                {[...Array(8)].map((_, i) => (
                  <rect
                    key={i}
                    x={860 + i * 25}
                    y="750"
                    width="20"
                    height="20"
                    fill="#9CA3AF"
                    opacity="0.1"
                    rx="2"
                  />
                ))}
                {[...Array(8)].map((_, i) => (
                  <rect
                    key={i}
                    x={860 + i * 25}
                    y="780"
                    width="20"
                    height="20"
                    fill="#9CA3AF"
                    opacity="0.1"
                    rx="2"
                  />
                ))}
              </g>

              {/* Mouse */}
              <g className="animate-float" style={{ animationDuration: '5s', animationDelay: '2.5s' }}>
                <ellipse cx="1100" cy="775" rx="25" ry="35" fill="#6B7280" opacity="0.12" />
                <line x1="1100" y1="750" x2="1100" y2="800" stroke="#9CA3AF" strokeWidth="1.5" opacity="0.08" />
              </g>

              {/* Floating Icons - WiFi Signal */}
              <g className="animate-pulse" style={{ animationDuration: '4s' }}>
                <path
                  d="M350 250 Q355 245 360 250"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.15"
                />
                <path
                  d="M345 260 Q355 250 365 260"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.1"
                />
                <path
                  d="M340 270 Q355 255 370 270"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.08"
                />
              </g>

              {/* Floating Icons - Code Brackets */}
              <g className="animate-bounce-subtle" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                <text x="1650" y="280" fontSize="80" fill="#F59E0B" opacity="0.12" fontFamily="monospace">
                  {'</>'}
                </text>
              </g>

              {/* Floating Icons - Light Bulb */}
              <g className="animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}>
                <circle cx="280" cy="450" r="30" fill="#FCD34D" opacity="0.15" />
                <rect x="270" y="480" width="20" height="15" fill="#9CA3AF" opacity="0.1" rx="2" />
              </g>
            </svg>

            {/* Additional Animated Gradient Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 via-transparent to-amber-100/30 animate-gradient"></div>
          </div>
        )}

        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/85"></div>

        {/* Additional subtle overlay with animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 via-transparent to-amber-50/40"></div>
      </div>

      {/* Animated Background Elements (enhancement) */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      <div
        className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
        style={{ animationDelay: '2s' }}
      ></div>
      <div
        className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
        style={{ animationDelay: '4s' }}
      ></div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-gradient {
          animation: gradient 15s ease-in-out infinite;
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
