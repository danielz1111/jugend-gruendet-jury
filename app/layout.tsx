import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Jugend gründet | Landheim Ammersee',description:'Gründerwettbewerb am Landheim Ammersee am 15. Januar 2027'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de"><body>{children}</body></html>}
