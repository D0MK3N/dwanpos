import React from 'react';

interface ClientDateProps {
  date: string | number | Date;
  format?: string;
}

// Format date to Indonesian locale, fallback to ISO if invalid
export default function ClientDate({ date, format }: ClientDateProps) {
  let d: Date;
  if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date);
  } else {
    d = date;
  }
  if (isNaN(d.getTime())) return <span>-</span>;
  // Default: dd MMM yyyy, HH:mm (WIB)
  const options: Intl.DateTimeFormatOptions = format
    ? {} // Custom format not supported by Intl, fallback
    : { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return (
    <span>{d.toLocaleString('id-ID', options)} WIB</span>
  );
}
