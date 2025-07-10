
#Project Design

## Color Schema / theme

theme: {
  extend: {
    colors: {
      primary: '#2563EB',
      primaryDark: '#1E40AF',
      primaryLight: '#BFDBFE',
      grayLight: '#F3F4F6',
      grayMedium: '#9CA3AF',
      grayDark: '#374151',
    }
  }
}


## Typography

import { Inter, Lusitana } from 'next/font/google';
 
export const inter = Inter({ subsets: ['latin'] });

export const lusitana = Lusitana({
  weight: ['400', '700'],
  subsets: ['latin'],
});

## General Layout

Header 
    * Logo
    * Headers
Main Screen
    *login Screen
    * Reviews and Rating boxes
    * Product Listing page
    * Selling Profiles
Navi
    *Link to different "main screens"
Footer 
    * Copyright
    * Contact details
    * Social media

## Other