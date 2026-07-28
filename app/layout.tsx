import type { Metadata } from 'next';
import './globals.css';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ConnectWalletModal } from '@/components/modals/ConnectWalletModal';
import { CreateEscrowModal } from '@/components/modals/CreateEscrowModal';
import { SubmitWorkModal } from '@/components/modals/SubmitWorkModal';
import { DisputeModal } from '@/components/modals/DisputeModal';
import { ResolveDisputeModal } from '@/components/modals/ResolveDisputeModal';

export const metadata: Metadata = {
  title: 'EscrowVault — Escrow Without Compromise',
  description: 'Milestone-based escrow on Stellar and Soroban. Funds released only on cryptographic proof of delivery. Non-custodial, instant settlement.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <SmoothScrollProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <ConnectWalletModal />
            <CreateEscrowModal />
            <SubmitWorkModal />
            <DisputeModal />
            <ResolveDisputeModal />
          </SmoothScrollProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
