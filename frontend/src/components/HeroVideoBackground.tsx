export default function HeroVideoBackground() {
  return (
    <div className="absolute inset-0" style={{ zIndex: -10 }}>
      {/* Video Background Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>

        {/* Light overlay for text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.65), rgba(255,255,255,0.55))'
          }}
        ></div>
      </div>

      {/* Animated Background Elements for depth */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float"></div>
      <div
        className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float"
        style={{ animationDelay: '2s' }}
      ></div>
      <div
        className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float"
        style={{ animationDelay: '4s' }}
      ></div>
    </div>
  );
}
