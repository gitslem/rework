import Image from 'next/image';
import { useRouter } from 'next/router';

interface LogoProps {
  className?: string;
  textClassName?: string;
  onClick?: () => void;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', textClassName = '', onClick, showText = true, size = 'md' }: LogoProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/');
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const imageSizes = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 }
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div
      className={`flex items-center cursor-pointer group ${className}`}
      onClick={handleClick}
    >
      {/* Logo Image */}
      <div className={`relative ${sizeClasses[size]} mr-3 transition-transform group-hover:scale-110 duration-200`}>
        <Image
          src="/logo.jpeg"
          alt="RemoteWorks Logo"
          width={imageSizes[size].width}
          height={imageSizes[size].height}
          className="object-contain rounded-lg"
          priority
        />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className={`${textSizes[size]} font-bold ${textClassName || 'text-black'}`}>
          Remote<span className="font-light">Works</span>
        </div>
      )}
    </div>
  );
}
