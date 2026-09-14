import StackupInternalHeader from "@/components/StackupInternalHeader";
import "@/app/internal-route-shell.css";

export default function Layout({children}:{children:React.ReactNode}){
  return <div id="stackup-internal-root" className="internal-screen-shell assistant-screen-shell"><StackupInternalHeader/><h1 className="module-screen-title">PERGUNTE À IA</h1>{children}</div>;
}
