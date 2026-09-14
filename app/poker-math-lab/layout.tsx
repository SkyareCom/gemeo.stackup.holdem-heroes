import StackupInternalHeader from "@/components/StackupInternalHeader";
import "@/app/internal-route-shell.css";

export default function Layout({children}:{children:React.ReactNode}){
  return <div className="internal-screen-shell"><StackupInternalHeader/>{children}</div>;
}
