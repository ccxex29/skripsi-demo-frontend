import React, {useEffect} from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Body from '../components/Body';
import Config from '../components/Config';
import {ConfigObjects} from '../interfaces/Config';
import {connect} from 'react-redux';
import defaults from '../strings/defaults';

interface IndexProps {
    readonly config: ConfigObjects;
}

const mapStateToProps = (state: {config: ConfigObjects}) => {
    return {
        config: state.config,
    }
}

const Index = (props: IndexProps) => {
    const pingFn = (simulatedBytes = 0) => {
        const time = {
            message: undefined,
            delivered: undefined,
            responded: undefined,
        };
        const now = () => {
            return (new Date()).getTime();
        }
        const selectedHost: string = props.config?.backend?.host ?? defaults.HOST_URL;
        const socket = new WebSocket(`ws${selectedHost.startsWith('localhost') ? '' : 's'}://${selectedHost}/ws`);
        socket.onopen = () => {
            time.message = now();
            socket.send(`ping${'0'.repeat(simulatedBytes)}`);
        };
        socket.onmessage = (msgEvent) => {
            if (typeof msgEvent?.data === 'string') {
                const parsedMsg = JSON.parse(msgEvent?.data);
                let deliveredTime = parsedMsg?.message;
                if (typeof deliveredTime === 'number') {
                    deliveredTime = (deliveredTime * 1000).toFixed();
                }
                time.responded = now();
                time.delivered = deliveredTime ?? undefined;
                const messageToDelivered = time.delivered - time.message;
                const deliveredToResponded = time.responded - time.delivered;
                console.log(`${parsedMsg?.status}: ${time.message};${time.delivered}(+${messageToDelivered}ms);${time.responded}(+${deliveredToResponded}ms)`);
            }
            socket.close();
        };
    }
    const attachPing = () => {
        // @ts-ignore
        window.ping = pingFn;
    }
    useEffect(() => {
        attachPing();
    }, []);
    return (
        <Config>
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
        </Config>
    );
};

export default connect(mapStateToProps, null)(Index);
