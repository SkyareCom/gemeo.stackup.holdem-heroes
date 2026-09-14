import StackupInternalHeader from "@/components/StackupInternalHeader";
import "@/app/internal-route-shell.css";

export default function Layout({children}:{children:React.ReactNode}){
  return <div id="stackup-internal-root" className="internal-screen-shell hand-review-screen-shell"><StackupInternalHeader/><h1 className="module-screen-title">ANÁLISE DE MÃOS</h1>{children}</div>;
}
