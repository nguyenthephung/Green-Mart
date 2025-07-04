import Sidebar from "../components/Guest/myOrder/Sidebar";
import Header from '../components/Guest/Header';
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
        <div className="font-sans min-h-screen flex flex-col">
          <Header />
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
    </div>
  );
};

export default DashboardLayout;
