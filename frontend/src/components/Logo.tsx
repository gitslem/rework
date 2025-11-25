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
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div
      className={`flex items-center cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Logo Image */}
      <div className={`relative ${sizeClasses[size]} mr-3`}>
        <Image
          src="/logo.svg"
          alt="RemoteWorks Logo"
          width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          className="object-contain"
          priority
        />
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
