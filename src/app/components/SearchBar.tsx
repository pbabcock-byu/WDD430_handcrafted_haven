'use client';

import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <input
      type="text"
      placeholder="Search products..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 rounded-lg border border-gray-medium text-gray-dark bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue"
    />
  );
}
