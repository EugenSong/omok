import "@/styles/globals.css";
import type { AppProps } from "next/app";

// nextjs allows fonts to be directly imported from google fonts
import { Roboto_Mono } from "next/font/google";

// how to add custom font to web app 
const roboto = Roboto_Mono({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={roboto.className}>
      <Component {...pageProps} />
    </main>
  );
}
