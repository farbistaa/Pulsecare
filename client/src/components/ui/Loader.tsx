// client/src/components/ui/Loader.tsx
import { HashLoader } from "react-spinners";

interface LoaderProps {
  color?: string;
  size?: number;
  loading?: boolean;
  text?: string;
  fullPage?: boolean;
  className?: string;
}

const Loader = ({ 
  color = "#ff0000", 
  size = 50, 
  loading = true, 
  text, 
  fullPage,
  className = "" 
}: LoaderProps) => {
  if (!loading) return null;
  
  return (
    <div className={`flex justify-center items-center ${fullPage ? 'min-h-screen' : ''} ${className}`}>
      <div className="text-center">
        <HashLoader color={color} size={size} />
        {text && <p className="mt-2 text-gray-600">{text}</p>}
      </div>
    </div>
  );
};

export default Loader;