import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="app-shell relative min-h-screen bg-gradient-to-b from-[#06010d] via-[#160726] to-[#1e1035] text-midnight">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 bg-pink-300/20 blur-[160px] -top-10 -left-10" />
        <div className="absolute w-[32rem] h-[32rem] bg-amber-200/20 blur-[200px] top-0 right-0" />
      </div>
      <Navbar />
      <main className="relative z-10 pb-10">{children}</main>
    </div>
  );
};

export default Layout;


