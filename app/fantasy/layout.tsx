import { FantasyDebugMenu } from '@/components/fantasy';

export default function FantasyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <FantasyDebugMenu />
    </>
  );
}
