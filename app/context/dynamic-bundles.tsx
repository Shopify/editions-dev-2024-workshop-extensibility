import { createContext, useContext, useState } from "react";
import type { PropsWithChildren } from "react";

interface BootstrapContext {
  bundleProductId?: string;
  cartTransformId?: string;
  setBundleProductId: (id: string) => void;
  setCartTransformId: (id: string) => void;
}

const Bootstrap = createContext<BootstrapContext>({
  setBundleProductId: () => {},
  setCartTransformId: () => {},
});

export function useBootstrapContext() {
  return useContext(Bootstrap);
}

export function BootstrapContext({ children }: PropsWithChildren) {
  const [bundleProductId, setBundleProductId] = useState<string | undefined>();
  const [cartTransformId, setCartTransformId] = useState<string | undefined>();

  const providerValue = {
    setBundleProductId,
    bundleProductId,
    setCartTransformId,
    cartTransformId,
  };

  return (
    <Bootstrap.Provider value={providerValue}>{children}</Bootstrap.Provider>
  );
}
