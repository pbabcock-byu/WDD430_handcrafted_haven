//You'll use this file to keep the fonts that will be used throughout your application.
// add Lusitana from google 
import { Inter, Lusitana } from 'next/font/google';
 
export const inter = Inter({ subsets: ['latin'] });

// Adding a secondary font
//In addition to specifying a subset like you did before, 
// you should also specify different font weights. For example, 400 (normal) and 700 (bold).
export const lusitana = Lusitana({
  weight: ['400', '700'],
  subsets: ['latin'],
});