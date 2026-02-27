import type { Metadata } from 'next';
import ProfileLayoutClient from './layout-client';

export const metadata: Metadata = {
  title: 'Profile Settings',
  description: 'Manage your profile and account settings',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <ProfileLayoutClient>{children}</ProfileLayoutClient>;
}
