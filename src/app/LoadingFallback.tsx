export function LoadingFallback() {
  return (
    <main className="page-loading" role="status" aria-live="polite">
      <span className="page-loading__mark" aria-hidden="true">
        वीणा
      </span>
      <span>Preparing your listening space</span>
    </main>
  );
}
