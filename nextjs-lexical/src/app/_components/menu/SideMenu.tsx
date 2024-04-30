import React from 'react';
import { Box, VStack, Link as ChakraLink, Icon, Text } from '@chakra-ui/react';
import { pagesPath } from '@/router/$path';
import Link from 'next/link';

export type SideMenuProps = {
    items: { url: string, title: string }[]
}

const SideMenu = ({ items }: SideMenuProps) => {
    return (
        <Box
            width="250px"
            height="100vh"
            bg="gray.50"
            borderRight="1px"
            borderColor="gray.200"
            position="sticky"
            overflowY="auto"
            left={0}
            top={0}
        >
            <VStack align="stretch" spacing={0} px={4} py={6}>
                <Link href={pagesPath.$url().path} passHref>
                    <ChakraLink href={pagesPath.$url().path} display="flex" alignItems="center" py={3} fontWeight="bold">
                        <Text>TOPに戻る</Text>
                    </ChakraLink>
                </Link>
                {items.map(item => (
                    <Link key={item.url} href={item.url} passHref>
                        <ChakraLink
                            display="flex"
                            alignItems="center"
                            py={3}
                            borderRadius="md"
                            _hover={{ bg: 'gray.100' }}
                        >
                            <Text>{item.title}</Text>
                        </ChakraLink>
                    </Link>
                ))}
            </VStack>
        </Box>
    );
};

export default SideMenu;