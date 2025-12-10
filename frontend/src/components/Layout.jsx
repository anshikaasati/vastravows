import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="app-shell relative min-h-screen text-midnight flex flex-col">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute w-[40rem] h-[40rem] bg-primary/5 blur-[120px] -top-20 -left-20" />
        <div className="absolute w-[35rem] h-[35rem] bg-secondary/10 blur-[100px] top-40 right-0" />
      </div>
      <Navbar />
      <main className="flex-grow relative z-10 w-full">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;


