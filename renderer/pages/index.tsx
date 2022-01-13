import React, {useEffect, useRef} from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Body from '../components/Body';
import nconf, {IOptions} from 'nconf';
import {connect} from 'react-redux';

interface IndexProps {
    config: IOptions;
}

const mapStateToProps = (state: {config: IOptions}) => {
    return {
        config: state.config,
    }
}

const Index = (props: IndexProps) => {
    const isFirstEffect = useRef(true);
    const setConfigFromState = (options: IOptions) => {
        for (const [key, value] of Object.entries(options)) {
            nconf.set(key, value);
        }
    }
    const saveNconf = () => {
        nconf.save((err: Error) => {
            if (err) {
                console.error(err.message);
                return;
            }
            // fs.readFile('./config.json', (err, data) => {
            //     console.dir(JSON.parse(data.toString()));
            // });
        });
    }
    useEffect(() => {
        const manualNconfSetDefault = (options: IOptions) => {
            for (const [key, value] of Object.entries(options)) {
                nconf.set(key, nconf.get(key) ?? value);
            }
        }
        nconf
            .file('config', {
                file: './config.json',
            });

        manualNconfSetDefault({
            'backend:host': nconf.get('backend:host') ?? 'localhost:8889',
            'backend:logging': false,
        });
        saveNconf();
    }, []);
    useEffect(() => {
        if (isFirstEffect.current) {
            isFirstEffect.current = false;
        }
        setConfigFromState(props.config);
        saveNconf();
    }, [props.config]);
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

export default connect(mapStateToProps, null)(Index);
