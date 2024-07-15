import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({children}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const[user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Below functionality is for if the user has logged in before it will give access to the current user.
        getCurrentUser().then((res) => {
            if(res) {
                setIsLoggedIn(true);
                setUser(res)
            }else{
                setIsLoggedIn(false);
                setUser(null);
            }
        })
        .catch((error) => {
            console.log(error);
        })
        .finally(() => {
            setIsLoading(false);
        })
    },[])

    return(
        <GlobalContext.Provider value={{
            isLoggedIn,
            setIsLoggedIn,
            user,
            setUser,
            isLoading,
        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export default GlobalProvider;