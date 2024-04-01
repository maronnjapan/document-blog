import React from "react";
import styles from "./styles/Button.module.css";

type Props = {
    children: React.ReactNode
    onClick?: () => void;
}
export default function PrimaryButton({ onClick, children }: Props) {

    return <button className={styles.button} onClick={onClick}>{children}</button>
}