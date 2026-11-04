import type { Metadata, Viewport } from 'next';
import './globals.css';
import './DeviceBase.css';
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover'};
export const metadata:Metadata={title:'Jugend gründet | Landheim Ammersee',description:'Gründerwettbewerb am Landheim Ammersee am 15. Januar 2027'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de"><body>{children}</body></html>}
