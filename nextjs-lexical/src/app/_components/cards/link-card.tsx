'use client';
import Link from 'next/link';
import React from 'react';

export type LinkCardProps = { title: string, content: string, link: string }
export const LinkCard = ({ title, content, link }: LinkCardProps) => {
    return (
        <div
            className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden "
        >
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                    {title}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-3">
                    {content}
                </p>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">

                <Link href={link} className="text-blue-600 text-sm font-medium transition-transform duration-300 hover:transform hover:scale-105">記事を読む →</Link>
            </div>
        </div>
    );
};