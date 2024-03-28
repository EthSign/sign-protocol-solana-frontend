import styles from "../styles/Home.module.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";

export default function AppBar() {
  return (
    // <div className={styles.AppHeader}>
    <div className={styles.AppHeader}>
      <Image src="/solanaLogo.png" height={30} width={200} alt="" />
      <span>Sign Protocol Solana</span>
      <WalletMultiButton />
    </div>
  );
}
