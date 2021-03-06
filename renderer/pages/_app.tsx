import '../public/styles/globals.sass';
import {Provider} from 'react-redux';
import {store} from '../redux/reduxBase'

const MyApp = ({Component, pageProps}) => {
    return (
        <Provider store={store}>
            <Component {...pageProps} />
        </Provider>
    );
};

export default MyApp;
