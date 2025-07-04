import Sidebar from "../components/Guest/myOrder/Sidebar";
import Header from '../components/Guest/Header';
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 min-h-0 bg-gray-50">
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-0">
          <Sidebar />
        </aside>
        <main className="flex-1 p-4 md:p-8 pt-[104px] md:pt-[88px] lg:pt-[80px] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
