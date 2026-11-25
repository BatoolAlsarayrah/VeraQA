import { Gallery } from '@/app/gallery';
import { ToastProvider } from '@/components/ui';

export function App() {
  return (
    <ToastProvider>
      <Gallery />
    </ToastProvider>
  );
}
