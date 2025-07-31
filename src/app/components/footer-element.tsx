import React from 'react';

export default function FooterElement({title, children}: {title: string, children: React.ReactNode}) {
  return <div className="flex-1">
    <h3 className='mb-2.5 text-[#251a86]'>{title}</h3>
    {children}
  </div>
}
