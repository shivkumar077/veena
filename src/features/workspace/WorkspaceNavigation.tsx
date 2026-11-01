import type { WorkspaceArea } from '../../types/workspace';

interface WorkspaceNavigationProps {
  activeArea: WorkspaceArea;
  onNavigate: (area: WorkspaceArea) => void;
}

const navigationItems: { area: WorkspaceArea; label: string }[] = [
  { area: 'sources', label: 'Sources' },
  { area: 'listen', label: 'Listening' },
  { area: 'lyrics', label: 'Lyrics' },
];

export function WorkspaceNavigation({
  activeArea,
  onNavigate,
}: WorkspaceNavigationProps) {
  return (
    <nav aria-label="Workspace areas" className="workspace-navigation">
      {navigationItems.map(({ area, label }) => (
        <button
          aria-current={activeArea === area ? 'page' : undefined}
          className="workspace-navigation__item"
          key={area}
          onClick={() => onNavigate(area)}
          type="button"
        >
          <span>{label}</span>
          {area === 'sources' && (
            <span aria-hidden="true" className="workspace-navigation__detail">
              Choose a source
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
