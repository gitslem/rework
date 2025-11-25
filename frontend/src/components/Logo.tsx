import Image from 'next/image';
import { useRouter } from 'next/router';

interface LogoProps {
  className?: string;
  textClassName?: string;
  onClick?: () => void;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const imageSizes = {
    sm: { width: 64, height: 64 },
    md: { width: 80, height: 80 },
    lg: { width: 96, height: 96 },
    xl: { width: 128, height: 128 }
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div
      className={`flex items-center cursor-pointer group ${className}`}
      onClick={handleClick}
    >
      {/* Logo Image - circular with all text visible */}
      <div className={`relative ${sizeClasses[size]} ${showText ? 'mr-3' : ''} transition-transform group-hover:scale-105 duration-200`}>
        <Image
          src="/logo.jpeg"
          alt="RemoteWorks Logo"
          width={imageSizes[size].width}
          height={imageSizes[size].height}
          className="object-contain rounded-full"
          style={{
            objectPosition: 'center'
          }}
          priority
        />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className={`${textSizes[size]} font-bold ${textClassName || 'text-black'}`}>
          Remote-<span className="font-light">Works</span>
        </div>
      )}
    </div>
  );
}
