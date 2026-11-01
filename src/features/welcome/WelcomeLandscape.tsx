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
        srcSet="/assets/welcome/welcome-portrait.webp"
        type="image/webp"
      />
      <img
        alt=""
        decoding="async"
        fetchPriority={loading === 'eager' ? 'high' : 'auto'}
        loading={loading}
        onError={onError}
        src="/assets/welcome/welcome-landscape.webp"
      />
    </picture>
  );
}
