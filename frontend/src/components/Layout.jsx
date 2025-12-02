import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="app-shell relative min-h-screen text-midnight">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[40rem] h-[40rem] bg-pink-300/20 blur-[120px] -top-20 -left-20 animate-pulse" />
        <div className="absolute w-[35rem] h-[35rem] bg-amber-200/20 blur-[100px] top-40 right-0" />
      </div>
      <Navbar />
      <main className="relative z-10 pb-16">{children}</main>
    </div>
  );
};

export default Layout;


