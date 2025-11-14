import { ReactNode } from "react";
import "./labs.css";

export default function LabsLayout({ children }: { children: ReactNode }) {
  return <div className="labs-container">{children}</div>;
}
