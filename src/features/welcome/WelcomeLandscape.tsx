interface WelcomeLandscapeProps {
  className: string;
  loading?: 'eager' | 'lazy';
  onError?: () => void;
}

export function WelcomeLandscape({
  className,
  loading = 'lazy',
  onError,
}: WelcomeLandscapeProps) {
  return (
    <picture aria-hidden="true" className={className}>
      <source
        media="(max-width: 767px)"
        srcSet="/assets/welcome/veena-world-portrait.svg"
        type="image/svg+xml"
      />
      <img
        alt=""
        decoding="async"
        fetchPriority={loading === 'eager' ? 'high' : 'auto'}
        loading={loading}
        onError={onError}
        src="/assets/welcome/veena-world.svg"
      />
    </picture>
  );
}
