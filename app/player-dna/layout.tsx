import StackupInternalHeader from "@/components/StackupInternalHeader";
import "@/app/internal-route-shell.css";

export default function PlayerDnaLayout({children}:{children:React.ReactNode}){
  return <div id="stackup-internal-root" className="internal-screen-shell player-dna-screen-shell"><StackupInternalHeader/><h1 className="module-screen-title">PLAYER DNA</h1>{children}</div>;
}
