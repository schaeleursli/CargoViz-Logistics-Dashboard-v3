import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
interface ProjectSelectorProps {
  darkMode: boolean;
}
const ProjectSelector = ({
  darkMode
}: ProjectSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('Port of Seattle');
  const projects = ['Port of Seattle', 'Oakland Terminal', 'Long Beach Yard', 'Miami Container Hub'];
  return <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center space-x-2 py-2 px-3 rounded-md ${darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-800'}`}>
        <span className="font-medium">{selectedProject}</span>
        <ChevronDownIcon size={16} />
      </button>
      {isOpen && <div className={`absolute mt-1 w-56 rounded-md shadow-lg z-10 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <ul className="py-1">
            {projects.map(project => <li key={project}>
                <button className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-800'} ${selectedProject === project ? 'font-medium' : ''}`} onClick={() => {
            setSelectedProject(project);
            setIsOpen(false);
          }}>
                  {project}
                </button>
              </li>)}
          </ul>
        </div>}
    </div>;
};
export default ProjectSelector;