import { FaHandPaper } from "react-icons/fa";
const links = [["About", "#about"], ["Live", "#live"], ["Voice", "#voice"], ["Gallery", "#gallery"], ["Developer", "#team"]];export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass !rounded-none border-x-0 border-t-0">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 font-extrabold"><FaHandPaper className="text-neon" /> SignBridge</a>
        <div className="flex gap-5 text-sm overflow-x-auto">
          {links.map(([n, h]) => <a key={n} href={h} className="hover:text-white transition whitespace-nowrap">{n}</a>)}
        </div>
      </div>
    </nav>
  );
}
