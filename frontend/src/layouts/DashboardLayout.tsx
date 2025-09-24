import Sidebar from '../components/Guest/myOrder/Sidebar';
import Header from '../components/Guest/Header';
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="font-sans min-h-screen flex flex-col bg-app-primary">
      <Header />
      <div className="flex flex-1 min-h-0 bg-app-primary">
        <aside className="hidden md:block w-64 bg-app-secondary border-r border-app-border min-h-0">
          <Sidebar />
        </aside>
        <main className="flex-1 p-4 md:p-8 pt-[104px] md:pt-[88px] lg:pt-[80px] overflow-auto bg-app-primary">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
