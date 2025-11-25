import Image from 'next/image';
import { useRouter } from 'next/router';

interface LogoProps {
  className?: string;
  textClassName?: string;
  onClick?: () => void;
  showText?: boolean;
}

export default function Logo({ className = '', textClassName = '', onClick, showText = true }: LogoProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/');
    }
  };

  return (
    <div
      className={`flex items-center cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Logo Image - will be visible when logo.jpeg is added to public folder */}
      <div className="relative w-10 h-10 mr-3">
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">R</span>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className={`text-2xl font-bold ${textClassName || 'text-black'}`}>
          Remote<span className="font-light">Works</span>
        </div>
      )}
    </div>
  );
}
