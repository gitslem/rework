import '@/styles/globals.css';
import '@/styles/animations.css';
import 'xterm/css/xterm.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReworkAI from '@/components/ReworkAI';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <ReworkAI />
    </QueryClientProvider>
  );
}
