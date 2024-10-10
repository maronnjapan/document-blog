import React from 'react';
import { pagesPath } from '@/router/$path';
import Link from 'next/link';

export type SideMenuProps = {
    items: { url: string, title: string }[]
}

const SideMenu = ({ items }: SideMenuProps) => {
    return (
        <div
            style={{ height: '100vh', width: '20%', maxWidth: '250px', backgroundColor: 'gray' }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem' }} >
                <Link href={pagesPath.$url().path} passHref>
                    TOPに戻る
                </Link>
                {items.map(item => (
                    <Link key={item.url} href={item.url} passHref>
                        {item.title}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SideMenu;