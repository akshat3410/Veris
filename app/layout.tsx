import type { Metadata } from 'next';
import './globals.css';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { GlowingOrb } from '@/components/visuals/GlowingOrb';
import { ConnectWalletModal } from '@/components/modals/ConnectWalletModal';
import { CreateEscrowModal } from '@/components/modals/CreateEscrowModal';
import { SubmitWorkModal } from '@/components/modals/SubmitWorkModal';
import { DisputeModal } from '@/components/modals/DisputeModal';
import { ResolveDisputeModal } from '@/components/modals/ResolveDisputeModal';

export const metadata: Metadata = {
  title: 'Stellar EscrowVault — Soroban Milestone Escrow Platform',
  description: 'Production-grade decentralized milestone escrow platform built on Stellar and Soroban smart contracts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-stellar-violet selection:text-white bg-stellar-obsidian min-h-screen flex flex-col relative">
        <ReactQueryProvider>
          <GlowingOrb />
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-12">
            {children}
          </main>
          <Footer />

          {/* Modal Container */}
          <ConnectWalletModal />
          <CreateEscrowModal />
          <SubmitWorkModal />
          <DisputeModal />
          <ResolveDisputeModal />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
