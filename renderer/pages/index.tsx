import React from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Body from '../components/Body';

const Index = () => {
    return (
        <React.Fragment>
            <Head>
                <title>Skripsi Frontend Client</title>
            </Head>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
            }}>
                <Header/>
                <Body />
            </div>
        </React.Fragment>
    );
};

export default Index;
