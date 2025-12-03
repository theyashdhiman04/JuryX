import {create} from "zustand"
import { BrowserProvider } from "ethers";

type UploadStore = {
    files: File[];
    setFiles: (files: File[]) => void;
  };
  
  export const useUploadStore = create<UploadStore>((set) => ({
    files: [],
    setFiles: (files) => set({ files }),
  }));


//   
type WebContainerFS = {
    [key: string]: 
      | { directory: WebContainerFS }
      | { file: { contents: string } }
  };
  
  type WebStore = {
    webContainerData: WebContainerFS | null;
    setWebContainerData: (data: WebContainerFS) => void;
  };
  
  export const useWebStore = create<WebStore>((set) => ({
    webContainerData: null,
    setWebContainerData: (container) => set({ webContainerData: container }),
  }));


  // 

  type Role = 'USER' | 'ORGANIZER' | 'PANELIST'

type User = {
  id: number
  email: string
  role?: Role
  eventId?:string
  isPublic?: boolean
}

type UserStore = {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}


export const useUserDetails = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))

// Web3 Wallet Store
type Web3Store = {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: { 
    signMessage: (message: string) => Promise<string>;
    sendTransaction: (tx: { to?: string; value?: bigint; data?: string }) => Promise<{ hash: string }>;
  } | null;
  setAddress: (address: string | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  setChainId: (chainId: number | null) => void;
  setProvider: (provider: BrowserProvider | null) => void;
  setSigner: (signer: { 
    signMessage: (message: string) => Promise<string>;
    sendTransaction: (tx: { to?: string; value?: bigint; data?: string }) => Promise<{ hash: string }>;
  } | null) => void;
  reset: () => void;
};

export const useWeb3Store = create<Web3Store>((set) => ({
  address: null,
  isConnected: false,
  chainId: null,
  provider: null,
  signer: null,
  setAddress: (address) => set({ address }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setChainId: (chainId) => set({ chainId }),
  setProvider: (provider) => set({ provider }),
  setSigner: (signer) => set({ signer }),
  reset: () =>
    set({
      address: null,
      isConnected: false,
      chainId: null,
      provider: null,
      signer: null,
    }),
}));