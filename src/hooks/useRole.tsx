import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Rol = "pm" | "dev";
const KEY = "aftercheck.rol";
const OLD_KEY = "verifix.rol";
const Ctx = createContext<{ rol: Rol; setRol: (r: Rol) => void }>({ rol: "pm", setRol: () => {} });

export function RoleProvider({ children }: { children: ReactNode }) {
  const [rol, setRolState] = useState<Rol>("pm");
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY) ?? localStorage.getItem(OLD_KEY);
      if (v === "pm" || v === "dev") setRolState(v);
    } catch {
      /* ignore */
    }
  }, []);
  const setRol = (r: Rol) => {
    setRolState(r);
    try {
      localStorage.setItem(KEY, r);
    } catch {
      /* ignore */
    }
  };
  return <Ctx.Provider value={{ rol, setRol }}>{children}</Ctx.Provider>;
}

export const useRole = () => useContext(Ctx);
