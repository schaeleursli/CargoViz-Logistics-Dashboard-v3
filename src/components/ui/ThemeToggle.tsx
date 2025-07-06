import React from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';
interface ThemeToggleProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}
const ThemeToggle = ({
  darkMode,
  setDarkMode
}: ThemeToggleProps) => {
  return <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-gray-100 text-gray-700'}`}>
      {darkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
    </button>;
};
export default ThemeToggle;