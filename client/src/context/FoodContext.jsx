import { createContext } from "react";

export const FoodContext = createContext(null);

export default function FoodContextProvider({ children }) {
  return <FoodContext.Provider value={""}>{children}</FoodContext.Provider>;
}
