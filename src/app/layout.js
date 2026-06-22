import './globals.css';

export const metadata = {
  title: 'DeployFlow AI - Dashboard',
  description: 'Autonomous client acquisition and web delivery platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
